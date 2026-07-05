import React from 'react';

const MasterLoader = ({ type = 'table', rows = 5 }) => {
  if (type === 'form') {
    return (
      <div className="p-lg animate-pulse">
        <div className="h-8 bg-background rounded w-1/4 mb-xl"></div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i}>
              <div className="h-4 bg-background rounded w-1/2 mb-sm"></div>
              <div className="h-10 bg-background rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // default table skeleton
  return (
    <div className="p-md animate-pulse">
      <div className="h-10 bg-background rounded mb-md w-full"></div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-12 bg-background rounded mb-sm w-full opacity-70"></div>
      ))}
    </div>
  );
};

export default MasterLoader;
