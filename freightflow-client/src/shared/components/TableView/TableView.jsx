import React from 'react';
import Loader from '../Loader';
import EmptyState from '../EmptyState';
import Pagination from '../Pagination';
import './TableView.css';

const TableView = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyStateMsg = 'No data available',
  paginationProps,
  onRowClick
}) => {
  if (isLoading) {
    return (
      <div className="table-view-container loading">
        <Loader size={32} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState description={emptyStateMsg} />;
  }

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
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'clickable-row' : ''}
              >
                {columns.map((col, colIndex) => (
                  <td key={col.key || colIndex}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginationProps && (
        <Pagination {...paginationProps} />
      )}
    </div>
  );
};

export default TableView;
