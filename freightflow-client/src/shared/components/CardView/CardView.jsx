import React from 'react';
import { MoreVertical } from 'lucide-react';
import Card, { CardContent, CardHeader, CardFooter } from '../Card';
import EmptyState from '../EmptyState';
import Loader from '../Loader';
import Pagination from '../Pagination';
import './CardView.css';

const CardView = ({
  data = [],
  isLoading = false,
  emptyStateMsg = 'No data available',
  paginationProps,
  renderCardHeader,
  renderCardBody,
  renderCardFooter,
  onCardClick,
  onActionClick
}) => {
  if (isLoading) {
    return (
      <div className="card-view-container loading">
        <Loader size={32} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState description={emptyStateMsg} />;
  }

  return (
    <div className="card-view-wrapper">
      <div className="card-view-grid">
        {data.map((item, index) => (
          <Card 
            key={item.id || index} 
            className={`data-card ${onCardClick ? 'clickable' : ''}`}
            onClick={() => onCardClick && onCardClick(item)}
          >
            <CardHeader className="data-card-header">
              {renderCardHeader ? renderCardHeader(item) : (
                <div className="data-card-default-header">
                  <h3>{item.title || `Item ${index + 1}`}</h3>
                  {onActionClick && (
                    <button 
                      className="data-card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onActionClick(item);
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {renderCardBody ? renderCardBody(item) : (
                <p className="data-card-desc">{item.description || 'No description'}</p>
              )}
            </CardContent>
            {renderCardFooter && (
              <CardFooter>
                {renderCardFooter(item)}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      {paginationProps && (
        <div className="card-view-pagination">
          <Pagination {...paginationProps} />
        </div>
      )}
    </div>
  );
};

export default CardView;
