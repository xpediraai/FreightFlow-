import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', className = '', type = 'text', count = 1 }) => {
  const renderSkeleton = () => {
    return Array.from({ length: count }).map((_, idx) => (
      <div 
        key={idx}
        className={`skeleton skeleton-shimmer skeleton-${type} ${className}`}
        style={{ width, height, borderRadius, marginBottom: count > 1 ? '10px' : '0' }}
      />
    ));
  };

  return <>{renderSkeleton()}</>;
};

export default Skeleton;
