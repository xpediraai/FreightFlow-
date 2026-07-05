import React from 'react';
import { Search, Plus, Grid, List } from 'lucide-react';
import Button from '../Button';

const MasterToolbar = ({ 
  onSearch, 
  searchTerm, 
  totalRecords = 0,
  entityName = 'Records',
  statusFilter = 'ALL STATUS',
  onStatusChange
}) => {
  return (
    <div className="master-toolbar flex justify-between align-center p-md" style={{ borderBottom: '1px solid var(--border-light)' }}>
      <div className="toolbar-left">
        <span className="font-bold text-secondary text-sm">
          Total {entityName}: {totalRecords}
        </span>
      </div>
      
      <div className="toolbar-right flex align-center gap-sm">
        {onStatusChange && (
          <select 
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="form-control"
            style={{ width: '150px' }}
          >
            <option value="ALL STATUS">ALL STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        )}
        
        <div className="search-input-wrapper relative">
          <Search size={16} className="text-secondary-light absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '32px', width: '250px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default MasterToolbar;
