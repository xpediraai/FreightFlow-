import React from 'react';
import { PackageOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import './EmptyState.css';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = 'No data found', 
  description = 'There is currently no data available to display.',
  action 
}) => {
  return (
    <motion.div 
      className="empty-state"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div 
        className="empty-state-icon"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Icon size={48} />
      </motion.div>
      <motion.h3 
        className="empty-state-title"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="empty-state-desc"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {description}
      </motion.p>
      {action && (
        <motion.div 
          className="empty-state-action"
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
