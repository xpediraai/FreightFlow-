import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDeleteModal.css';
import Button from '../Button';

const ConfirmDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  entityName,
  isDeleting = false 
}) => {
  if (!isOpen) return null;

  const displayItemName = entityName || itemName;

  return (
    <AnimatePresence>
      <div className="confirm-delete-overlay" onClick={!isDeleting ? onClose : undefined}>
        <motion.div 
          className="confirm-delete-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="confirm-delete-header">
            <div className="icon-circle">
              <AlertTriangle size={24} color="#dc2626" />
            </div>
            <button className="close-btn" onClick={onClose} disabled={isDeleting}>
              <X size={20} />
            </button>
          </div>
          
          <div className="confirm-delete-body">
            <h3>{title}</h3>
            <p>
              {message}
              {displayItemName && (
                <span className="item-name"> "{displayItemName}"</span>
              )}
            </p>
          </div>
          
          <div className="confirm-delete-footer">
            <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={onConfirm} 
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
