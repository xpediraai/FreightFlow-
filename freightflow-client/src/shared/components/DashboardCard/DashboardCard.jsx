import React from 'react';
import clsx from 'clsx';
import Card, { CardContent } from '../../../shared/components/Card';
import './DashboardCard.css';

const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  trendValue,
  className 
}) => {
  return (
    <Card className={clsx('dashboard-summary-card', className)}>
      <CardContent className="dashboard-summary-content">
        <div className="summary-info">
          <p className="summary-title">{title}</p>
          <h3 className="summary-value">{value}</h3>
          {(description || trend) && (
            <p className="summary-description">
              {trend && (
                <span className={clsx('trend', trend)}>
                  {trendValue} 
                </span>
              )}
              {description && <span className="desc-text">{description}</span>}
            </p>
          )}
        </div>
        {Icon && (
          <div className="summary-icon-wrapper">
            <Icon size={24} className="summary-icon" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
