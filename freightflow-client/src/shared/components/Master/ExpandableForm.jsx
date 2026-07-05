import React from 'react';

const ExpandableForm = ({ isOpen, children }) => {
  if (!isOpen) return null;
  return (
    <div className="expandable-form-container bg-surface border-light rounded-lg shadow-sm mb-lg animate-slide-down">
      {children}
    </div>
  );
};

export default ExpandableForm;
