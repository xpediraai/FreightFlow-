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

          <span
            className="sidebar-chevron"
            style={{
              opacity: isOpen ? 1 : 0,
            }}
          >
            {isExpanded ? (
              <ChevronDown size={15} />
            ) : (
              <ChevronRight size={15} />
            )}
          </span>

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
        clsx(
          'sidebar-nav-item',
          {
            'sidebar-nav-active': isActive,
          }
        )
      }
      style={{
        paddingLeft,
      }}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={
              level === 0
                ? 19
                : level === 1
                  ? 16
                  : 14
            }
            className="sidebar-nav-icon"
            style={{
              opacity: level > 1 ? 0.65 : 1,
            }}
          />

          <span
            className="sidebar-nav-label"
            style={{
              opacity: isOpen ? 1 : 0,
              width: isOpen ? 'auto' : 0,
            }}
          >
            {item.name}
          </span>
        </>
      )}
    </NavLink>
  );
};


/* =========================================================
   SIDEBAR
========================================================= */

const Sidebar = ({ isOpen }) => {
  const { currentUser } = useAuth();


  const navItems = getNavItems(currentUser?.role);

  const [activeMenus, setActiveMenus] = useState({});


  return (
    <aside
      className={clsx(
        'layout-sidebar',
        {
          closed: !isOpen,
        }
      )}
    >

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div
        style={{
          opacity: isOpen ? 1 : 0,
          height: '64px'
        }}
      >
        <img height={'64px'} width={'100%'} src='\src\assets\FFLogoRed-removebg-preview.png' />
      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="sidebar-navigation">
        <div className="sidebar-section-label">
          MENU
        </div>

        {navItems.map((item, idx) => (
          <NavItem key={idx} item={item} isOpen={isOpen} activeMenus={activeMenus} setActiveMenus={setActiveMenus} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
