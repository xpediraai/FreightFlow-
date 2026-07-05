import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpandableForm = ({ isOpen, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="expandable-form-container bg-surface border-light rounded-lg shadow-sm mb-lg overflow-hidden"
          initial={{ height: 0, opacity: 0, scale: 0.98 }}
          animate={{ height: 'auto', opacity: 1, scale: 1 }}
          exit={{ height: 0, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpandableForm;
