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
    <div className="master-toolbar flex justify-between align-center p-md" style={{ borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
      <div className="toolbar-left" style={{ flex: '1 1 auto', minWidth: '150px' }}>
        <span className="font-bold text-secondary text-sm">
          Total {entityName}: {totalRecords}
        </span>
      </div>
      
      <div className="toolbar-right flex align-center gap-sm" style={{ flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
        {onStatusChange && (
          <select 
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="form-control"
            style={{ flex: '1 1 auto', minWidth: '130px', maxWidth: '200px' }}
          >
            <option value="ALL STATUS">ALL STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        )}
        
        <div className="search-input-wrapper relative" style={{ flex: '2 1 auto', minWidth: '200px', maxWidth: '350px' }}>
          <Search size={16} className="text-secondary-light absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="form-control w-full"
            style={{ paddingLeft: '32px', width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default MasterToolbar;
