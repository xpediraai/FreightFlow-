import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`page-transition-wrapper ${className}`}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
