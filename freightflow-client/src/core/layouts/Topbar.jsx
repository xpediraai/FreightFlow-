import React, { useState, useEffect, useRef } from 'react';
import { Menu, Building2, ChevronDown, Mail, LogOut, Grip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../modules/admin/services/admin.service';

const Topbar = ({ onToggleSidebar, onOpenLauncher, navMode = 'both', isSidebarOpen = true }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(currentUser?.company_name);
  const dropdownRef = useRef(null);

  useEffect(() => {
    adminService.getCompanies().then(res => {
      let companyData = [];
      if (res?.data?.data && Array.isArray(res.data.data)) {
        companyData = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        companyData = res.data;
      } else if (Array.isArray(res)) {
        companyData = res;
      }
      setCompanies(companyData);

      // Auto-select if there is exactly one company
      if (companyData.length === 1) {
        setSelectedCompany(companyData[0].company_name);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="layout-header flex justify-between items-center w-full" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-light)', backgroundColor: '#fff' }}>
      <div className="flex items-center gap-md" style={{ minWidth: '40px' }}>
        <AnimatePresence>
          {(navMode === 'sidebar' || navMode === 'both') && (
            <motion.button 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onToggleSidebar} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <Menu size={24} className="text-secondary" />
            </motion.button>
          )}
        </AnimatePresence>
        {currentUser?.full_name && (
          <span className="font-semibold text-secondary flex items-center mr-2" style={{ fontSize: '14px' }}>
            {currentUser.full_name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-md ml-auto" ref={dropdownRef}>

        {/* User Name */}


        {/* Company Selector */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-outline btn-sm flex items-center gap-sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Building2 size={16} className="text-primary" />
            <span className="font-semibold text-secondary" style={{ fontSize: '13px' }}>{selectedCompany}</span>
            <ChevronDown size={16} className="text-secondary-light" />
          </button>

          {isDropdownOpen && (
            <div
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                backgroundColor: '#fff', border: '1px solid var(--color-light)',
                borderRadius: 'var(--radius-md)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minWidth: '220px', zIndex: 50, maxHeight: '300px', overflowY: 'auto',
                display: 'flex', flexDirection: 'column'
              }}
            >
              {companies.map(company => (
                <div
                  key={company.id}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid var(--color-light)' }}
                  className="hover:bg-surface text-secondary font-medium transition-colors"
                  onClick={() => {
                    setSelectedCompany(company.company_name);
                    setIsDropdownOpen(false);
                  }}
                >
                  {company.company_name}
                </div>
              ))}
              {companies.length === 0 && (
                <div style={{ padding: '10px 16px', fontSize: '13px' }} className="text-secondary-light text-center">
                  No companies found
                </div>
              )}
            </div>
          )}
        </div>

        {/* 9 Dots / Launcher Toggle */}
        <AnimatePresence>
          {(navMode === 'menubar' || navMode === 'both') && (
            <motion.button 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onOpenLauncher} 
              className={`flex items-center justify-center transition-all ${!isSidebarOpen && navMode === 'both' ? 'bg-primary text-white shadow-md' : 'hover:bg-surface text-secondary'}`} 
              style={{ background: !isSidebarOpen && navMode === 'both' ? 'var(--color-primary)' : 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
            >
              <Grip size={20} className={!isSidebarOpen && navMode === 'both' ? 'text-white' : 'text-secondary'} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn btn-outline btn-sm flex items-center gap-sm hover:bg-danger hover:text-white hover:border-danger transition-colors text-secondary"
        >
          <LogOut size={16} />
          <span className="font-medium" style={{ fontSize: '13px' }}>Logout</span>
        </button>

      </div>
    </header>
  );
};

export default Topbar;
