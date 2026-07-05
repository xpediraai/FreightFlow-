import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="layout-app" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: 'var(--spacing-lg)' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
