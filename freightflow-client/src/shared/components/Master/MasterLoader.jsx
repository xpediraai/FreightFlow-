import React from 'react';

const MasterLoader = ({ type = 'table', rows = 6 }) => {
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

  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', padding: '16px' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div 
            key={i} 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '14px', 
              border: '1px solid #e5e7eb', 
              borderTop: '4px solid #e5e7eb', 
              padding: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }} 
            className="animate-pulse"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ height: '18px', width: '80px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
              <div style={{ height: '20px', width: '64px', backgroundColor: '#e5e7eb', borderRadius: '20px' }}></div>
            </div>
            <div style={{ height: '16px', width: '150px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '14px' }}></div>
            <div style={{ height: '64px', backgroundColor: '#f3f4f6', borderRadius: '10px', marginBottom: '16px' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ height: '32px', width: '70px', backgroundColor: '#e5e7eb', borderRadius: '8px' }}></div>
              <div style={{ height: '32px', width: '36px', backgroundColor: '#fee2e2', borderRadius: '8px' }}></div>
            </div>
          </div>
        ))}
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
