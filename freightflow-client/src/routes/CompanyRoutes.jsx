import React from 'react';
import Dashboard from '../modules/company/pages/Dashboard/Dashboard';
import Companies from '../modules/admin/pages/Companies/Companies';
import Countries from '../modules/company/pages/Masters/Foundation/Country/Countries';
import States from '../modules/company/pages/Masters/Foundation/State/States';
import Cities from '../modules/company/pages/Masters/Foundation/City/Cities';

import Currencies from '../modules/company/pages/Masters/Foundation/Currency/Currencies';
import PaymentTerms from '../modules/company/pages/Masters/Foundation/PaymentTerm/PaymentTerms';

// Common Masters
import UOMs from '../modules/company/pages/Masters/Common/UOM/UOMs';
import PackageTypes from '../modules/company/pages/Masters/Common/PackageType/PackageTypes';
import Incoterms from '../modules/company/pages/Masters/Common/Incoterm/Incoterms';
import TransportModes from '../modules/company/pages/Masters/Common/TransportMode/TransportModes';
import ContainerTypes from '../modules/company/pages/Masters/Common/ContainerType/ContainerTypes';
import Commodities from '../modules/company/pages/Masters/Common/Commodity/Commodities';
import Charges from '../modules/company/pages/Masters/Common/Charge/Charges';

// Logistics Masters
import Ports from '../modules/company/pages/Masters/Logistics/Port/Ports';
import ShippingLines from '../modules/company/pages/Masters/Logistics/ShippingLine/ShippingLines';
import Warehouses from '../modules/company/pages/Masters/Logistics/Warehouse/Warehouses';
import Vehicles from '../modules/company/pages/Masters/Logistics/Vehicle/Vehicles';
import Drivers from '../modules/company/pages/Masters/Logistics/Driver/Drivers';

// Organization Masters
import Departments from '../modules/company/pages/Masters/Organization/Department/Departments';
import Designations from '../modules/company/pages/Masters/Organization/Designation/Designations';
import Employees from '../modules/company/pages/Masters/Organization/Employee/Employees';

// Business Masters
import Customers from '../modules/company/pages/Masters/Business/Customer/Customers';
import Vendors from '../modules/company/pages/Masters/Business/Vendor/Vendors';

// Placeholders for unimplemented features
const GenericPlaceholder = ({ title }) => (
  <div style={{ padding: '2rem' }}>
    <h2>{title}</h2>
    <p>Module content will be implemented in future phases.</p>
  </div>
);

const CompanyRoutes = [
  {
    path: 'dashboard',
    element: <Dashboard />,
  },
  {
    path: 'company',
    element: <Companies />, // Reusing the Super Admin component
  },
  {
    path: 'masters/foundation/country',
    element: <Countries />,
  },
  {
    path: 'masters/foundation/state',
    element: <States />,
  },
  {
    path: 'masters/foundation/city',
    element: <Cities />,
  },
  {
    path: 'masters/foundation/currency',
    element: <Currencies />,
  },
  {
    path: 'masters/foundation/payment-terms',
    element: <PaymentTerms />,
  },
  {
    path: 'masters/common/uom',
    element: <UOMs />,
  },
  {
    path: 'masters/common/package-type',
    element: <PackageTypes />,
  },
  {
    path: 'masters/common/incoterm',
    element: <Incoterms />,
  },
  {
    path: 'masters/common/transport-mode',
    element: <TransportModes />,
  },
  {
    path: 'masters/common/container-type',
    element: <ContainerTypes />,
  },
  {
    path: 'masters/logistics/port',
    element: <Ports />,
  },
  {
    path: 'masters/logistics/shipping-line',
    element: <ShippingLines />,
  },
  {
    path: 'masters/logistics/warehouse',
    element: <Warehouses />,
  },
  {
    path: 'masters/logistics/vehicle',
    element: <Vehicles />,
  },
  {
    path: 'masters/logistics/driver',
    element: <Drivers />,
  },
  {
    path: 'masters/organization/department',
    element: <Departments />,
  },
  {
    path: 'masters/organization/designation',
    element: <Designations />,
  },
  {
    path: 'masters/organization/employee',
    element: <Employees />,
  },
  {
    path: 'masters/business/customer',
    element: <Customers />,
  },
  {
    path: 'masters/business/vendor',
    element: <Vendors />,
  },
  {
    path: 'masters/business/commodity',
    element: <Commodities />,
  },
  {
    path: 'masters/business/charge',
    element: <Charges />,
  },
  {
    path: 'masters/*',
    element: <GenericPlaceholder title="Masters Overview" />,
  }
];

export default CompanyRoutes;
