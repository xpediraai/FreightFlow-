import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Briefcase,
  Truck,
  FileText,
  Receipt,
  Warehouse,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';

export const applications = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    route: '/',
    color: 'var(--primary)',
    description: 'Overview and quick actions',
    isVisible: true,
    order: 1,
  },
  {
    id: 'company',
    name: 'Company',
    icon: Building2,
    route: '/companies',
    color: '#0288D1', // Info blue
    description: 'Manage company profiles',
    isVisible: true,
    order: 2,
  },
  {
    id: 'masters',
    name: 'Masters',
    icon: Package,
    route: '/masters',
    color: '#2E7D32', // Success green
    description: 'Master data management',
    isVisible: true,
    order: 3,
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: Users,
    route: '/customers',
    color: '#ED6C02', // Warning orange
    description: 'Customer relationships',
    isVisible: true,
    order: 4,
  },
  {
    id: 'vendors',
    name: 'Vendors',
    icon: Briefcase,
    route: '/vendors',
    color: '#9C27B0', // Purple
    description: 'Vendor management',
    isVisible: true,
    order: 5,
  },
  {
    id: 'shipment',
    name: 'Shipment',
    icon: Truck,
    route: '/shipments',
    color: '#1976D2', // Blue
    description: 'Logistics & tracking',
    isVisible: true,
    order: 6,
  },
  {
    id: 'quotation',
    name: 'Quotation',
    icon: FileText,
    route: '/quotations',
    color: '#00796B', // Teal
    description: 'Sales quotes & estimates',
    isVisible: true,
    order: 7,
  },
  {
    id: 'invoices',
    name: 'Invoices',
    icon: Receipt,
    route: '/invoices',
    color: '#D32F2F', // Danger red
    description: 'Billing & payments',
    isVisible: true,
    order: 8,
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    icon: Warehouse,
    route: '/warehouse',
    color: '#F57C00', // Orange
    description: 'Inventory & storage',
    isVisible: true,
    order: 9,
  },
  {
    id: 'reports',
    name: 'Reports',
    icon: BarChart3,
    route: '/reports',
    color: '#388E3C', // Green
    description: 'Business reports',
    isVisible: true,
    order: 10,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    route: '/settings',
    color: '#616161', // Grey
    description: 'System configuration',
    isVisible: true,
    order: 11,
  },
  {
    id: 'roles',
    name: 'Roles & Permissions',
    icon: Shield,
    route: '/roles',
    color: '#455A64', // Blue grey
    description: 'Access control',
    isVisible: true,
    order: 12,
  },
];
