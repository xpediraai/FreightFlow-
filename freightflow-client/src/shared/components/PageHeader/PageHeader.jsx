import React from 'react';
import { RefreshCw, Download } from 'lucide-react';
import Button from '../Button';
import './PageHeader.css';

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs, 
  primaryAction, 
  secondaryAction,
  onRefresh,
  onExport 
}) => {
  return (
    <div className="page-header">
      <div className="page-header-title-section">
        {breadcrumbs && (
          <nav className="page-breadcrumbs">
            {breadcrumbs.map((bc, index) => (
              <span key={index}>
                {bc.label}
                {index < breadcrumbs.length - 1 && <span className="mx-xs">/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      
      <div className="page-header-actions">
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} leftIcon={RefreshCw}>
            Refresh
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} leftIcon={Download}>
            Export
          </Button>
        )}
        {secondaryAction && (
          <Button variant="secondary" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button variant="primary" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
