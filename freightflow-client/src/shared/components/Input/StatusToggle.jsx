import React from 'react';
import './StatusToggle.css';

const StatusToggle = ({ value, onChange, disabled }) => {
  const isActive = value === 'Active' || value === 'ACTIVE' || value === true;

  const handleToggle = () => {
    if (disabled) return;
    onChange(isActive ? 'Inactive' : 'Active');
  };

  return (
    <div className="status-toggle-wrapper">
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        disabled={disabled}
        onClick={handleToggle}
        className={`status-toggle-btn ${isActive ? 'active' : 'inactive'}`}
      >
        <span className="status-toggle-thumb" />
      </button>
      <span className={`status-toggle-label ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? 'ACTIVE' : 'INACTIVE'}
      </span>
    </div>
  );
};

export default StatusToggle;
