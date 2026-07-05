import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ContentWrapper from './ContentWrapper';
import ApplicationLauncher from '../../shared/components/ApplicationLauncher';

const MainLayout = () => {
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="layout-app">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="layout-main">
        <Topbar 
          onOpenLauncher={() => setIsLauncherOpen(true)} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <ContentWrapper>
          <Outlet />
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
