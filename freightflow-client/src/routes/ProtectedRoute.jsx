import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { tokenHelper } from '../core/storage/tokenHelper';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const token = tokenHelper.getToken();

  if (isInitializing) {
    return <div>Loading...</div>; // Could use Loader component here
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
