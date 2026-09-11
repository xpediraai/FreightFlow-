import React from 'react';
import Skeleton from '../Skeleton/Skeleton';
import EmptyState from '../EmptyState';
import Pagination from '../Pagination';
import './TableView.css';
import { motion, AnimatePresence } from 'framer-motion';

const TableView = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyStateMsg = 'No data available',
  paginationProps,
  onRowClick
}) => {
  return (
    <div className="table-view-wrapper">
      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={col.key || index} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      <Skeleton height="20px" width={colIndex === 0 ? '60%' : '100%'} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (!data || data.length === 0) ? (
              <tr key="empty">
                <td colSpan={columns.length} style={{ padding: '0' }}>
                  <div style={{ padding: '2rem' }}>
                    <EmptyState description={emptyStateMsg} />
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <motion.tr 
                  key={row.id || rowIndex} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(rowIndex * 0.03, 0.3), duration: 0.2 }}
                >
                  {columns.map((col, colIndex) => (
                    <td key={col.key || colIndex}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {paginationProps && !isLoading && data?.length > 0 && (
        <Pagination {...paginationProps} />
      )}
    </div>
  );
};

export default TableView;
