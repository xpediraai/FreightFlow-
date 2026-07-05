import React from 'react';
import { Navigate } from 'react-router-dom';
import { tokenHelper } from '../core/storage/tokenHelper';
import Login from '../modules/auth/pages/Login/Login';

const PublicRoutes = [
  {
    path: '', // Note: we changed this to '' earlier since parent in index.js is /login
    element: <Login />,
  }
];

export default PublicRoutes;
