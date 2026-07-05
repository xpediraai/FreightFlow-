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
            <AnimatePresence mode="wait">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <motion.tr 
                    key={`skeleton-${rowIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex}>
                        <Skeleton height="20px" width={colIndex === 0 ? '60%' : '100%'} />
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (!data || data.length === 0) ? (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={columns.length} style={{ padding: '0' }}>
                    <div style={{ padding: '2rem' }}>
                      <EmptyState description={emptyStateMsg} />
                    </div>
                  </td>
                </motion.tr>
              ) : (
                data.map((row, rowIndex) => (
                  <motion.tr 
                    key={row.id || rowIndex} 
                    onClick={() => onRowClick && onRowClick(row)}
                    className={onRowClick ? 'clickable-row' : ''}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(rowIndex * 0.05, 0.5), duration: 0.3 }}
                  >
                    {columns.map((col, colIndex) => (
                      <td key={col.key || colIndex}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
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
