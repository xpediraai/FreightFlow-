import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  onLimitChange
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination">
      <div className="pagination-info flex align-center gap-md">
        {onLimitChange && (
          <div className="flex align-center gap-xs">
            <select 
              value={itemsPerPage} 
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="form-control"
              style={{ width: '70px', padding: '0.2rem 0.5rem', height: '30px' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-secondary-light">records per page</span>
          </div>
        )}
        {totalItems > 0 ? (
          <span className="text-sm">Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries</span>
        ) : (
          <span className="text-sm">No results</span>
        )}
      </div>
      
      <div className="pagination-controls">
        <button 
          className="pagination-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        
        <span className="pagination-current">
          Page {currentPage} of {totalPages}
        </span>
        
        <button 
          className="pagination-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
