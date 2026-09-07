import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children, className = '' }) => {
  return (
    <div
      className={`page-transition-wrapper ${className}`}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
