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
import { getNavItems } from '../config/navigation';



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
          <div className="flex align-center gap-md" style={{ overflow: 'hidden' }}>
            <Icon size={level === 0 ? 20 : 16} style={{ flexShrink: 0 }} />
            <span style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap', display: 'inline-block' }}>{item.name}</span>
          </div>
          <div style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s' }}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
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
      <Icon size={level === 0 ? 20 : (level === 1 ? 16 : 14)} style={{ opacity: level > 1 ? 0.5 : 1, flexShrink: 0 }} />
      <span style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap', display: 'inline-block', overflow: 'hidden' }}>{item.name}</span>
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
        <h2 className="text-primary font-bold whitespace-nowrap overflow-hidden" style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s' }}>FreightFlow</h2>
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
