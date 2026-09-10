import React, { useState, useEffect, useRef } from 'react';
import { Menu, Building2, ChevronDown, Mail, LogOut, Grip, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../modules/auth/services/auth.service';

const Topbar = ({ onToggleSidebar, onOpenLauncher, navMode = 'both', isSidebarOpen = true }) => {
  const { currentUser, logout, switchCompany } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(currentUser?.company_name || 'Select Company');
  const dropdownRef = useRef(null);

  const resolveDefaultCompanyId = (companyData) => {
    const storedId = localStorage.getItem('freightflow_default_company_id');
    if (storedId) {
      const found = companyData.find(c => String(c.id || c.company_code) === String(storedId));
      if (found) return String(found.id || found.company_code);
    }
    const dbDefault = companyData.find(c => c.is_default);
    if (dbDefault) return String(dbDefault.id || dbDefault.company_code);
    const shanti = companyData.find(c => (c.company_name || c.name) === 'Shanti');
    if (shanti) return String(shanti.id || shanti.company_code);
    if (companyData.length > 0) return String(companyData[0].id || companyData[0].company_code);
    return null;
  };

  useEffect(() => {
    const loadUserCompanies = () => {
      authService.getUserCompanies().then(res => {
        let companyData = [];
        if (res?.data?.data && Array.isArray(res.data.data)) {
          companyData = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
          companyData = res.data;
        } else if (Array.isArray(res)) {
          companyData = res;
        }
        setCompanies(companyData);

        const effectiveDefaultId = resolveDefaultCompanyId(companyData);

        // Auto-select starred default company if configured
        if (effectiveDefaultId) {
          const matchingDefault = companyData.find(c => String(c.id || c.company_code) === String(effectiveDefaultId));
          if (matchingDefault) {
            setSelectedCompany(matchingDefault.company_name);
            if (currentUser?.company_id !== matchingDefault.id) {
              switchCompany(matchingDefault.id);
            }
            return;
          }
        }

        // Fallback auto-select
        if (companyData.length === 1 && !currentUser?.company_name) {
          setSelectedCompany(companyData[0].company_name);
        } else if (currentUser?.company_id) {
          const matchingCompany = companyData.find(c => c.id === currentUser.company_id);
          if (matchingCompany) {
            setSelectedCompany(matchingCompany.company_name);
          }
        }
      }).catch(console.error);
    };

    loadUserCompanies();
    window.addEventListener('default_company_changed', loadUserCompanies);
    return () => {
      window.removeEventListener('default_company_changed', loadUserCompanies);
    };
  }, [currentUser?.company_id]);

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

  const handleCompanySelect = async (company) => {
    const compId = company.id || company.company_code;
    const compName = company.company_name || company.name;

    // Automatically set selected company as default login company and trigger star update
    localStorage.setItem('freightflow_default_company_id', compId);
    localStorage.setItem('freightflow_default_company_name', compName);
    window.dispatchEvent(new Event('default_company_changed'));

    if (company.id === currentUser?.company_id) {
      setIsDropdownOpen(false);
      return;
    }
    
    setIsSwitching(true);
    setSelectedCompany(company.company_name);
    setIsDropdownOpen(false);
    
    await switchCompany(company.id);
    setIsSwitching(false);
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

        {/* Company Selector */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-outline btn-sm flex items-center gap-sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isSwitching}
          >
            <Building2 size={16} className="text-primary" />
            <span className="font-semibold text-secondary" style={{ fontSize: '13px' }}>
              {isSwitching ? 'Switching...' : selectedCompany}
            </span>
            {isSwitching ? <Loader2 size={16} className="text-secondary animate-spin" /> : <ChevronDown size={16} className="text-secondary-light" />}
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
              {(() => {
                const effectiveDefaultId = resolveDefaultCompanyId(companies);
                return companies.map(company => {
                  const isDefault = String(company.id || company.company_code) === String(effectiveDefaultId);
                  return (
                    <div
                      key={company.id}
                      style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid var(--color-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      className={`hover:bg-surface text-secondary font-medium transition-colors ${company.id === currentUser?.company_id ? 'bg-primary-light text-primary' : ''}`}
                      onClick={() => handleCompanySelect(company)}
                    >
                      <span>{company.company_name}</span>
                      {isDefault && (
                        <span style={{ fontSize: '0.75rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <Star size={12} fill="#d97706" color="#d97706" /> Default
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
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
