import React from 'react';
import { PackageOpen } from 'lucide-react';
import './EmptyState.css';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = 'No data found', 
  description = 'There is currently no data available to display.',
  action 
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
