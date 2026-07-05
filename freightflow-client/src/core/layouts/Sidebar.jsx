import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Truck, Package, Settings, LogOut, ChevronDown, ChevronRight, Circle } from 'lucide-react';
import clsx from 'clsx';
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
          children: [
            { name: 'Company', path: '/company/company' },
            { name: 'Country', path: '/company/masters/foundation/country' },
            { name: 'State', path: '/company/masters/foundation/state' },
            { name: 'City', path: '/company/masters/foundation/city' },
            { name: 'Currency', path: '/company/masters/foundation/currency' },
            { name: 'Payment Terms', path: '/company/masters/foundation/payment-terms' },
          ]
        },
        {
          name: 'Common',
          children: [
            { name: 'UOM', path: '/company/masters/common/uom' },
            { name: 'Package Type', path: '/company/masters/common/package-type' },
            { name: 'Incoterm', path: '/company/masters/common/incoterm' },
            { name: 'Transport Mode', path: '/company/masters/common/transport-mode' },
            { name: 'Container Type', path: '/company/masters/common/container-type' },
          ]
        },
        {
          name: 'Logistics',
          children: [
            { name: 'Port', path: '/company/masters/logistics/port' },
            { name: 'Shipping Line', path: '/company/masters/logistics/shipping-line' },
            { name: 'Warehouse', path: '/company/masters/logistics/warehouse' },
            { name: 'Vehicle', path: '/company/masters/logistics/vehicle' },
            { name: 'Driver', path: '/company/masters/logistics/driver' },
          ]
        },
        {
          name: 'Organization',
          children: [
            { name: 'Department', path: '/company/masters/organization/department' },
            { name: 'Designation', path: '/company/masters/organization/designation' },
            { name: 'Employee', path: '/company/masters/organization/employee' },
          ]
        },
        {
          name: 'Business',
          children: [
            { name: 'Customer', path: '/company/masters/business/customer' },
            { name: 'Vendor', path: '/company/masters/business/vendor' },
            { name: 'Commodity', path: '/company/masters/business/commodity' },
            { name: 'Charge', path: '/company/masters/business/charge' },
          ]
        }
      ]
    },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];
};

const NavItem = ({ item, level = 0, isOpen }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon || Circle;
  const paddingLeft = `${(level * 1.5) + 1}rem`;

  if (item.children) {
    return (
      <div className="nav-group">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full p-sm hover:bg-secondary-dark"
          style={{ paddingLeft, borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'all var(--transition)', color: 'white' }}
        >
          <div className="flex align-center gap-md">
            <Icon size={level === 0 ? 20 : 14} />
            {isOpen && <span>{item.name}</span>}
          </div>
          {isOpen && (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>
        {expanded && isOpen && (
          <div className="nav-children">
            {item.children.map((child, idx) => (
              <NavItem key={idx} item={child} level={level + 1} isOpen={isOpen} />
            ))}
          </div>
        )}
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
      <Icon size={level === 0 ? 20 : 8} />
      {isOpen && <span>{item.name}</span>}
    </NavLink>
  );
};

const Sidebar = ({ isOpen }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItems(currentUser?.role);

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
          <NavItem key={idx} item={item} isOpen={isOpen} />
        ))}
      </nav>
      <div className="p-md mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-md p-sm text-secondary-light w-full hover:text-primary" 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color var(--transition)' }}
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
