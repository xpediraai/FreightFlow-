import React from 'react';
import { Menu, Bell, Grip } from 'lucide-react';

const Topbar = ({ onOpenLauncher, onToggleSidebar }) => {
  return (
    <header className="layout-header flex justify-between items-center w-full">
      <div className="flex items-center gap-md">
        <button onClick={onToggleSidebar} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Menu size={24} className="text-secondary" />
        </button>
        <div className="d-none md:d-block text-secondary-light font-medium">
          {/* Breadcrumb Placeholder */}
          Dashboard / Overview
        </div>
      </div>
      
      <div className="flex items-center gap-md ml-auto">
        <button 
          onClick={onOpenLauncher} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          title="Application Launcher"
        >
          <Grip size={24} className="text-primary" />
        </button>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Bell size={20} className="text-secondary" />
        </button>
        <div className="flex items-center gap-sm">
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
            A
          </div>
          <span className="text-sm font-medium d-none md:d-block">Admin User</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
