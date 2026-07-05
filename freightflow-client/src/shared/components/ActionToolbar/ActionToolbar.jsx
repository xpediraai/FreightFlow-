import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import Input from '../Input';
import Button from '../Button';
import './ActionToolbar.css';

const ActionToolbar = ({ 
  searchPlaceholder = 'Search...', 
  onSearch, 
  onFilter, 
  onAdd, 
  addLabel = 'Add New',
  customActions 
}) => {
  return (
    <div className="action-toolbar">
      <div className="action-toolbar-search">
        <Input 
          placeholder={searchPlaceholder}
          prefix={Search}
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>
      <div className="action-toolbar-actions">
        {onFilter && (
          <Button variant="outline" leftIcon={Filter} onClick={onFilter}>
            Filters
          </Button>
        )}
        {customActions}
        {onAdd && (
          <Button variant="primary" leftIcon={Plus} onClick={onAdd}>
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActionToolbar;
