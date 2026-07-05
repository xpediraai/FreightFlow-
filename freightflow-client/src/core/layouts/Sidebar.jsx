import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Truck, Package, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Companies', path: '/companies', icon: Building2 },
  { name: 'Masters', path: '/masters', icon: Package },
  { name: 'Shipments', path: '/shipments', icon: Truck },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={clsx('layout-sidebar', { 'closed': !isOpen })}>
      <div className="p-lg flex items-center justify-center border-b" style={{ borderColor: 'var(--secondary-dark)' }}>
        <h2 className="text-primary font-bold whitespace-nowrap overflow-hidden">FreightFlow</h2>
      </div>
      <nav className="flex-col gap-sm p-md flex-grow overflow-y-auto" style={{ display: 'flex' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-md p-sm ${
                  isActive ? 'text-primary bg-secondary-dark' : 'text-secondary-light'
                }`
              }
              style={{
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                transition: 'background-color var(--transition)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-md mt-auto">
        <button className="flex items-center gap-md p-sm text-secondary-light w-full hover:text-primary" style={{ background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color var(--transition)' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
