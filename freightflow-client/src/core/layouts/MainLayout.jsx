import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ContentWrapper from './ContentWrapper';
import ApplicationLauncher from '../../shared/components/ApplicationLauncher';
import PageTransition from '../../shared/components/PageTransition/PageTransition';

const MainLayout = () => {
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [navMode, setNavMode] = useState(localStorage.getItem('preferredNavMode') || 'both');
  const location = useLocation();

  useEffect(() => {
    const handleNavModeChange = () => {
      setNavMode(localStorage.getItem('preferredNavMode') || 'both');
    };
    window.addEventListener('navModeChanged', handleNavModeChange);
    return () => window.removeEventListener('navModeChanged', handleNavModeChange);
  }, []);

  const showSidebar = navMode === 'sidebar' || navMode === 'both';

  return (
    <div className="layout-app">
      <AnimatePresence initial={false}>
        {showSidebar && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ display: 'flex' }}
          >
            <Sidebar isOpen={isSidebarOpen} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="layout-main" style={{ width: '100%' }}>
        <Topbar 
          onOpenLauncher={() => setIsLauncherOpen(true)} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          navMode={navMode}
          isSidebarOpen={isSidebarOpen}
        />
        <ContentWrapper>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </ContentWrapper>
      </div>
      <ApplicationLauncher 
        isOpen={isLauncherOpen} 
        onClose={() => setIsLauncherOpen(false)} 
      />
    </div>
  );
};

export default MainLayout;
