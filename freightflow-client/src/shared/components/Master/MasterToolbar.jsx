import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

const MasterToolbar = ({ 
  onSearch, 
  searchTerm, 
  totalRecords = 0,
  entityName = 'Records',
  statusFilter = 'ALL STATUS',
  onStatusChange,
  viewMode = 'table',
  onViewModeChange
}) => {
  return (
    <div className="master-toolbar flex justify-between align-center p-md" style={{ borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
      <div className="toolbar-left flex align-center gap-md" style={{ flex: '1 1 auto', minWidth: '150px' }}>
        <span className="font-bold text-secondary text-sm">
          Total {entityName}: {totalRecords}
        </span>

        {/* VIEW MODE SEGMENTED TOGGLE */}
        {onViewModeChange && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #e5e7eb', 
              borderRadius: '10px', 
              padding: '3px',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)'
            }}
          >
            <button
              type="button"
              onClick={() => onViewModeChange('card')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: (viewMode === 'card' || viewMode === 'grid') ? '#ffffff' : 'transparent',
                color: (viewMode === 'card' || viewMode === 'grid') ? '#dc2626' : '#6b7280',
                boxShadow: (viewMode === 'card' || viewMode === 'grid') ? '0 2px 5px rgba(0, 0, 0, 0.08)' : 'none'
              }}
              title="Card Grid View"
            >
              <LayoutGrid size={14} style={{ color: (viewMode === 'card' || viewMode === 'grid') ? '#dc2626' : '#6b7280' }} /> Cards
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#dc2626' : '#6b7280',
                boxShadow: viewMode === 'table' ? '0 2px 5px rgba(0, 0, 0, 0.08)' : 'none'
              }}
              title="Table View"
            >
              <List size={14} style={{ color: viewMode === 'table' ? '#dc2626' : '#6b7280' }} /> Table
            </button>
          </div>
        )}
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
