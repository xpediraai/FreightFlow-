import React from 'react';
import Dashboard from '../modules/admin/pages/Dashboard/Dashboard';
import Companies from '../modules/admin/pages/Companies/Companies';
import EmployeeOverview from '../modules/admin/pages/EmployeeOverview/EmployeeOverview';
import Settings from '../modules/admin/pages/Settings/Settings';

// Placeholders
const GenericPlaceholder = ({ title }) => <div><h2>{title}</h2><p>Module content goes here.</p></div>;

const PrivateRoutes = [
  {
    index: true,
    element: <Dashboard />,
  },
  {
    path: 'companies',
    element: <Companies />,
  },
  {
    path: 'employees',
    element: <EmployeeOverview />,
  },
  {
    path: 'shipments',
    element: <GenericPlaceholder title="Shipments" />,
  },
  {
    path: 'customers',
    element: <GenericPlaceholder title="Customers" />,
  },
  {
    path: 'settings',
    element: <Settings />,
  },
];

export default PrivateRoutes;
