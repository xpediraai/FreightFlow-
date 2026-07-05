import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { getNavItems } from '../../../core/config/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import './ApplicationLauncher.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
};

const ApplicationLauncher = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [path, setPath] = useState([]);
  const { currentUser } = useAuth();

  const handleClose = () => {
    setPath([]);
    onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (path.length > 0) {
          setPath(p => p.slice(0, -1));
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, path]);

  // Prevent scrolling on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      // Reset path when closed from outside
      setTimeout(() => setPath([]), 300);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const navItems = getNavItems(currentUser?.role);
  let currentItems = navItems;
  for (const step of path) {
    const found = currentItems.find(item => item.name === step);
    if (found && found.children) {
      currentItems = found.children;
    } else {
      break;
    }
  }

  const handleItemClick = (item) => {
    if (item.children) {
      setPath([...path, item.name]);
    } else if (item.path) {
      navigate(item.path);
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="launcher-overlay"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="launcher-modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="launcher-modal-header">
              <div className="launcher-modal-title">
                {path.length > 0 ? (
                  <button className="launcher-back-btn" onClick={() => setPath(path.slice(0, -1))}>
                    <ArrowLeft size={18} />
                    <span>Back</span>
                  </button>
                ) : (
                  <h2>FREIGHTFLOW ERP — ALL MODULES</h2>
                )}
              </div>
              <button className="launcher-close-btn" onClick={handleClose} aria-label="Close Launcher">
                <X size={20} />
              </button>
            </div>
            
            <motion.div 
              className="launcher-grid-centered"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              key={path.join('-')} // Animate grid when path changes
            >
              {currentItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.button 
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={`${item.name}-${idx}`} 
                    className="launcher-app-item"
                    onClick={() => handleItemClick(item)}
                  >
                    <div 
                      className="launcher-app-icon-wrapper" 
                      style={{ backgroundColor: item.color || '#333' }}
                    >
                      <Icon size={28} color="#ffffff" />
                    </div>
                    <span className="launcher-app-label">{item.name}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationLauncher;
