import React, { useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './ExpandableSection.css';

const ExpandableSection = ({ title, children, defaultExpanded = false, className, headerAction }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={clsx('expandable-section', { 'is-expanded': isExpanded }, className)}>
      <div 
        className="expandable-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="expandable-title-area">
          <h3 className="expandable-title">{title}</h3>
          {headerAction && (
            <div className="expandable-action" onClick={(e) => e.stopPropagation()}>
              {headerAction}
            </div>
          )}
        </div>
        <button className="expandable-toggle" type="button">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      <div 
        className="expandable-content"
        style={{
          maxHeight: isExpanded ? '5000px' : '0',
          opacity: isExpanded ? 1 : 0,
          overflow: isExpanded ? 'visible' : 'hidden',
          padding: isExpanded ? '1.5rem' : '0 1.5rem',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ExpandableSection;
