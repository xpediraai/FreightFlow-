import { 
  LayoutDashboard, Users, Building2, Truck, Package, Settings, Circle, 
  Globe, Box, Briefcase, MapPin, Grid, Map, CreditCard, Ruler, PackageOpen, FileText, Plane, Anchor, Ship, 
  Warehouse, Car, Award, Store, ShoppingBag, Receipt, DollarSign
} from 'lucide-react';

export const getNavItems = (role) => {
  if (role === 'SUPER_ADMIN') {
    return [
      { name: 'Dashboard', path: '/app', icon: LayoutDashboard, color: '#1976D2' },
      { name: 'Companies', path: '/app/companies', icon: Building2, color: '#0288D1' },
      { name: 'Employee Overview', path: '/app/employees', icon: Users, color: '#9C27B0' },
      { name: 'Settings', path: '/app/settings', icon: Settings, color: '#616161' },
    ];
  }
  
  return [
    { name: 'Dashboard', path: '/company/dashboard', icon: LayoutDashboard, color: '#1976D2' },
    { 
      name: 'Masters', 
      icon: Package,
      color: '#E91E63',
      children: [
        {
          name: 'Foundation',
          icon: MapPin,
          color: '#0288D1',
          children: [
            { name: 'Company', path: '/company/company', icon: Building2, color: '#1976D2' },
            { name: 'Country', path: '/company/masters/foundation/country', icon: Globe, color: '#00796B' },
            { name: 'State', path: '/company/masters/foundation/state', icon: Map, color: '#2E7D32' },
            { name: 'City', path: '/company/masters/foundation/city', icon: MapPin, color: '#F57C00' },
            { name: 'Currency', path: '/company/masters/foundation/currency', icon: DollarSign, color: '#ED6C02' },
            { name: 'Payment Terms', path: '/company/masters/foundation/payment-terms', icon: CreditCard, color: '#9C27B0' },
          ]
        },
        {
          name: 'Common',
          icon: Grid,
          color: '#9C27B0',
          children: [
            { name: 'UOM', path: '/company/masters/common/uom', icon: Ruler, color: '#1976D2' },
            { name: 'Package Type', path: '/company/masters/common/package-type', icon: PackageOpen, color: '#E91E63' },
            { name: 'Incoterm', path: '/company/masters/common/incoterm', icon: FileText, color: '#D32F2F' },
            { name: 'Transport Mode', path: '/company/masters/common/transport-mode', icon: Plane, color: '#0288D1' },
            { name: 'Container Type', path: '/company/masters/common/container-type', icon: Box, color: '#F57C00' },
          ]
        },
        {
          name: 'Logistics',
          icon: Truck,
          color: '#2E7D32',
          children: [
            { name: 'Port', path: '/company/masters/logistics/port', icon: Anchor, color: '#0288D1' },
            { name: 'Shipping Line', path: '/company/masters/logistics/shipping-line', icon: Ship, color: '#00796B' },
            { name: 'Warehouse', path: '/company/masters/logistics/warehouse', icon: Warehouse, color: '#F57C00' },
            { name: 'Vehicle', path: '/company/masters/logistics/vehicle', icon: Car, color: '#1976D2' },
            { name: 'Driver', path: '/company/masters/logistics/driver', icon: Users, color: '#9C27B0' },
          ]
        },
        {
          name: 'Organization',
          icon: Users,
          color: '#ED6C02',
          children: [
            { name: 'Department', path: '/company/masters/organization/department', icon: Building2, color: '#1976D2' },
            { name: 'Designation', path: '/company/masters/organization/designation', icon: Award, color: '#F57C00' },
            { name: 'Employee', path: '/company/masters/organization/employee', icon: Users, color: '#9C27B0' },
          ]
        },
        {
          name: 'Business',
          icon: Briefcase,
          color: '#00796B',
          children: [
            { name: 'Customer', path: '/company/masters/business/customer', icon: Users, color: '#0288D1' },
            { name: 'Vendor', path: '/company/masters/business/vendor', icon: Store, color: '#9C27B0' },
            { name: 'Commodity', path: '/company/masters/business/commodity', icon: ShoppingBag, color: '#ED6C02' },
            { name: 'Charge', path: '/company/masters/business/charge', icon: Receipt, color: '#D32F2F' },
          ]
        }
      ]
    },
    { name: 'Settings', path: '/app/settings', icon: Settings, color: '#616161' },
  ];
};
