import React from 'react';
import { Search, Plus, Grid, List } from 'lucide-react';
import Button from '../Button';

const MasterToolbar = ({ 
  onSearch, 
  searchTerm, 
  onAdd, 
  onToggleView, 
  viewMode = 'table', 
  addLabel = 'Add New',
  hideAdd = false
}) => {
  return (
    <div className="master-toolbar flex justify-between align-center mb-lg">
      <div className="toolbar-left">
        <div className="search-input-wrapper relative">
          <Search size={18} className="text-secondary-light absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '35px', width: '300px' }}
          />
        </div>
      </div>
      <div className="toolbar-right flex align-center gap-sm">
        <div className="view-toggle flex bg-background border-light rounded-md p-xs gap-xs">
          <button 
            className={`btn flex align-center gap-xs ${viewMode === 'table' ? 'bg-primary text-white border-none' : 'bg-transparent text-secondary border-none shadow-none'}`}
            style={{ padding: '0.4rem 0.8rem' }}
            onClick={() => onToggleView('table')}
            title="Table View"
          >
            <List size={16} />
          </button>
          <button 
            className={`btn flex align-center gap-xs ${viewMode === 'card' ? 'bg-primary text-white border-none' : 'bg-transparent text-secondary border-none shadow-none'}`}
            style={{ padding: '0.4rem 0.8rem' }}
            onClick={() => onToggleView('card')}
            title="Card View"
          >
            <Grid size={16} />
          </button>
        </div>
        {!hideAdd && (
          <Button variant="primary" onClick={onAdd} leftIcon={Plus}>
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MasterToolbar;
