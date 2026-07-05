import React from 'react';

// Placeholders
const DashboardPlaceholder = () => <div><h2>Dashboard</h2><p>Welcome to FreightFlow ERP</p></div>;
const GenericPlaceholder = ({ title }) => <div><h2>{title}</h2><p>Module content goes here.</p></div>;

const PrivateRoutes = [
  {
    index: true,
    element: <DashboardPlaceholder />,
  },
  {
    path: 'companies',
    element: <GenericPlaceholder title="Companies" />,
  },
  {
    path: 'masters',
    element: <GenericPlaceholder title="Masters" />,
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
    element: <GenericPlaceholder title="Settings" />,
  },
];

export default PrivateRoutes;
