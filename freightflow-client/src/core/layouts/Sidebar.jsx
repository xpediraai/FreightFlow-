import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Truck, Package, Settings, LogOut, ChevronDown, ChevronRight, Circle, 
  Globe, Box, Briefcase, MapPin, Grid, Map, CreditCard, Ruler, PackageOpen, FileText, Plane, Anchor, Ship, 
  Warehouse, Car, Award, Store, ShoppingBag, Receipt, DollarSign
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const getNavItems = (role) => {
  if (role === 'SUPER_ADMIN') {
    return [
      { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
      { name: 'Companies', path: '/app/companies', icon: Building2 },
      { name: 'Employee Overview', path: '/app/employees', icon: Users },
      { name: 'Settings', path: '/app/settings', icon: Settings },
    ];
  }
  // COMPANY_OWNER exact hierarchy
  return [
    { name: 'Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
    { 
      name: 'Masters', 
      icon: Package,
      children: [
        {
          name: 'Foundation',
          icon: MapPin,
          children: [
            { name: 'Company', path: '/company/company', icon: Building2 },
            { name: 'Country', path: '/company/masters/foundation/country', icon: Globe },
            { name: 'State', path: '/company/masters/foundation/state', icon: Map },
            { name: 'City', path: '/company/masters/foundation/city', icon: MapPin },
            { name: 'Currency', path: '/company/masters/foundation/currency', icon: DollarSign },
            { name: 'Payment Terms', path: '/company/masters/foundation/payment-terms', icon: CreditCard },
          ]
        },
        {
          name: 'Common',
          icon: Grid,
          children: [
            { name: 'UOM', path: '/company/masters/common/uom', icon: Ruler },
            { name: 'Package Type', path: '/company/masters/common/package-type', icon: PackageOpen },
            { name: 'Incoterm', path: '/company/masters/common/incoterm', icon: FileText },
            { name: 'Transport Mode', path: '/company/masters/common/transport-mode', icon: Plane },
            { name: 'Container Type', path: '/company/masters/common/container-type', icon: Box },
          ]
        },
        {
          name: 'Logistics',
          icon: Truck,
          children: [
            { name: 'Port', path: '/company/masters/logistics/port', icon: Anchor },
            { name: 'Shipping Line', path: '/company/masters/logistics/shipping-line', icon: Ship },
            { name: 'Warehouse', path: '/company/masters/logistics/warehouse', icon: Warehouse },
            { name: 'Vehicle', path: '/company/masters/logistics/vehicle', icon: Car },
            { name: 'Driver', path: '/company/masters/logistics/driver', icon: Users },
          ]
        },
        {
          name: 'Organization',
          icon: Users,
          children: [
            { name: 'Department', path: '/company/masters/organization/department', icon: Building2 },
            { name: 'Designation', path: '/company/masters/organization/designation', icon: Award },
            { name: 'Employee', path: '/company/masters/organization/employee', icon: Users },
          ]
        },
        {
          name: 'Business',
          icon: Briefcase,
          children: [
            { name: 'Customer', path: '/company/masters/business/customer', icon: Users },
            { name: 'Vendor', path: '/company/masters/business/vendor', icon: Store },
            { name: 'Commodity', path: '/company/masters/business/commodity', icon: ShoppingBag },
            { name: 'Charge', path: '/company/masters/business/charge', icon: Receipt },
          ]
        }
      ]
    },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];
};

const NavItem = ({ item, level = 0, isOpen, activeMenus, setActiveMenus }) => {
  const isExpanded = activeMenus[level] === item.name;
  const Icon = item.icon || Circle;
  const paddingLeft = `${(level * 1.5) + 1}rem`;

  const handleToggle = () => {
    if (isExpanded) {
      const newActive = { ...activeMenus };
      delete newActive[level];
      // clear deeper levels
      Object.keys(newActive).forEach(key => {
        if (Number(key) > level) delete newActive[key];
      });
      setActiveMenus(newActive);
    } else {
      const newActive = { ...activeMenus, [level]: item.name };
      // clear deeper levels
      Object.keys(newActive).forEach(key => {
        if (Number(key) > level) delete newActive[key];
      });
      setActiveMenus(newActive);
    }
  };

  if (item.children) {
    return (
      <div className="nav-group">
        <button
          onClick={handleToggle}
          className={`flex items-center justify-between w-full p-sm hover:bg-secondary-dark ${isExpanded ? 'bg-secondary-dark' : ''}`}
          style={{ paddingLeft, borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'all var(--transition)', color: 'white' }}
        >
          <div className="flex align-center gap-md">
            <Icon size={level === 0 ? 20 : 16} />
            {isOpen && <span>{item.name}</span>}
          </div>
          {isOpen && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && isOpen && (
            <motion.div 
              className="nav-children overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {item.children.map((child, idx) => (
                <NavItem key={idx} item={child} level={level + 1} isOpen={isOpen} activeMenus={activeMenus} setActiveMenus={setActiveMenus} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === '/app' || item.path === '/company/dashboard'}
      className={({ isActive }) =>
        `flex items-center gap-md p-sm ${isActive ? 'bg-secondary-dark' : ''}`
      }
      style={({ isActive }) => ({
        paddingLeft,
        textDecoration: 'none',
        borderRadius: 'var(--radius-sm)',
        transition: 'background-color var(--transition)',
        whiteSpace: 'nowrap',
        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)'
      })}
    >
      <Icon size={level === 0 ? 20 : (level === 1 ? 16 : 14)} style={{ opacity: level > 1 ? 0.5 : 1 }} />
      {isOpen && <span>{item.name}</span>}
    </NavLink>
  );
};

const Sidebar = ({ isOpen }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItems(currentUser?.role);
  const [activeMenus, setActiveMenus] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={clsx('layout-sidebar', { 'closed': !isOpen })} style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="p-lg flex items-center justify-center border-b" style={{ borderColor: 'var(--secondary-dark)' }}>
        <h2 className="text-primary font-bold whitespace-nowrap overflow-hidden">FreightFlow</h2>
      </div>
      <nav className="flex-col gap-xs p-md flex-grow overflow-y-auto" style={{ display: 'flex' }}>
        {navItems.map((item, idx) => (
          <NavItem key={idx} item={item} isOpen={isOpen} activeMenus={activeMenus} setActiveMenus={setActiveMenus} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
