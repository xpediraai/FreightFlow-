import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ContentWrapper from './ContentWrapper';
import ApplicationLauncher from '../../shared/components/ApplicationLauncher';
import PageTransition from '../../shared/components/PageTransition/PageTransition';

const MainLayout = () => {
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="layout-app">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="layout-main">
        <Topbar 
          onOpenLauncher={() => setIsLauncherOpen(true)} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
