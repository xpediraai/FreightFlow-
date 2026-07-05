import React from 'react';

const ContentWrapper = ({ children }) => {
  return (
    <main className="layout-content">
      {children}
    </main>
  );
};

export default ContentWrapper;
