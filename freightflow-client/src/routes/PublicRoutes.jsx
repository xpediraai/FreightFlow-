import React from 'react';
import { Navigate } from 'react-router-dom';
import { tokenHelper } from '../core/storage/tokenHelper';

// Placeholder for Login
const LoginPlaceholder = () => (
  <div style={{ textAlign: 'center' }}>
    <h1 className="text-primary mb-md">FreightFlow ERP</h1>
    <p>Please login to continue</p>
    {/* Real login form would go here */}
  </div>
);

const PublicRoutes = [
  {
    path: 'login',
    element: <LoginPlaceholder />,
  }
];

export default PublicRoutes;
