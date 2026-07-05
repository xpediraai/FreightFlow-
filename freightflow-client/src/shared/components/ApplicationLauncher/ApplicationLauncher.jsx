import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { applications } from '../../../core/config/applications';
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scrolling on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const { currentUser } = useAuth();

  const handleAppClick = (route) => {
    navigate(route);
    onClose();
  };

  const visibleApps = applications
    .filter(app => {
      if (!app.isVisible) return false;
      if (currentUser?.role === 'SUPER_ADMIN') {
        return ['dashboard', 'company', 'roles', 'settings'].includes(app.id);
      } else if (currentUser?.role === 'COMPANY_OWNER') {
        return ['dashboard', 'company', 'masters', 'settings'].includes(app.id);
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="launcher-overlay"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="launcher-container"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="launcher-header">
              <h2>Application Launcher</h2>
              <button className="launcher-close" onClick={onClose} aria-label="Close Launcher">
                <X size={24} />
              </button>
            </div>
            
            <motion.div 
              className="launcher-grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {visibleApps.map((app) => {
                const Icon = app.icon;
                return (
                  <motion.button 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    key={app.id} 
                    className="launcher-card"
                    onClick={() => handleAppClick(app.route)}
                  >
                    <div 
                      className="launcher-card-icon" 
                      style={{ backgroundColor: `${app.color}15`, color: app.color }}
                    >
                      <Icon size={32} />
                    </div>
                    <div className="launcher-card-content">
                      <h3 className="launcher-card-title">{app.name}</h3>
                      <p className="launcher-card-desc">{app.description}</p>
                    </div>
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
