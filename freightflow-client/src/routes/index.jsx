import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthLayout from '../core/layouts/AuthLayout';
import MainLayout from '../core/layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoutes from './PublicRoutes';
import PrivateRoutes from './PrivateRoutes';
import LandingPage from '../modules/landing/LandingPage';

const NotFoundPlaceholder = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>404 - Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: PublicRoutes,
  },
  {
    path: '/app',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: PrivateRoutes,
  },
  {
    path: '*',
    element: <NotFoundPlaceholder />,
  }
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
