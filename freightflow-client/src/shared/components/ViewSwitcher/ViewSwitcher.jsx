import React from 'react';
import { List, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';
import './ViewSwitcher.css';

const ViewSwitcher = ({ view, onViewChange }) => {
  return (
    <div className="view-switcher">
      <button 
        className={clsx('view-switcher-btn', { 'active': view === 'table' })}
        onClick={() => onViewChange('table')}
        aria-label="Table View"
      >
        <List size={20} />
      </button>
      <button 
        className={clsx('view-switcher-btn', { 'active': view === 'card' })}
        onClick={() => onViewChange('card')}
        aria-label="Card View"
      >
        <LayoutGrid size={20} />
      </button>
    </div>
  );
};

export default ViewSwitcher;
