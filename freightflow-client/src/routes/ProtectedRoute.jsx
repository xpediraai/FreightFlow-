import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { tokenHelper } from '../core/storage/tokenHelper';

const ProtectedRoute = ({ children }) => {
  const token = tokenHelper.getToken();

  if (!token) {
    // If we wanted to strictly enforce login in this boilerplate:
    // return <Navigate to="/login" replace />;
    
    // For the sake of the starter working without backend auth setup yet:
    console.warn("No token found, but allowing access for development starter kit.");
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
