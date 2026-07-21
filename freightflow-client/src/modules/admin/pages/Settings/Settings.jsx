import React, { useState } from 'react';
import { Save, User, Layout, Sidebar as SidebarIcon, Table, CreditCard, Grip, AppWindow } from 'lucide-react';
import Page from '../../../../shared/components/Page';
import PageHeader from '../../../../shared/components/PageHeader';
import Button from '../../../../shared/components/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
};

const Settings = () => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredViewMode') || 'table');
  const [navMode, setNavMode] = useState(localStorage.getItem('preferredNavMode') || 'both');
  const [isSaving, setIsSaving] = useState(false);

  const handleNavModeChange = (mode) => {
    setNavMode(mode);
    localStorage.setItem('preferredNavMode', mode);
    window.dispatchEvent(new Event('navModeChanged'));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 800);
  };

  return (
    <Page>
      <PageHeader
        title="Platform Settings"
        subtitle="Global configurations and preferences for your account."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Settings' }]}
        primaryAction={{ label: 'Save Changes', onClick: handleSave }}
      />

      <div className="settings-container mt-lg flex justify-center">
        {/* Content Area */}
        <motion.div
          className="settings-content flex-col gap-xl w-full"
          style={{ maxWidth: '800px' }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Profile Section */}
          <motion.div variants={itemVariants} className="settings-card bg-surface border-light rounded-lg shadow-sm p-xl mb-lg">
            <div className="flex align-center gap-sm mb-lg border-b-light pb-sm">
              <div className="bg-primary-light p-xs rounded-md">
                <User size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold m-0 text-secondary">My Profile</h3>
            </div>

            <div className="profile-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="flex-col gap-xs">
                <span className="text-sm text-secondary-light font-medium uppercase tracking-wider">Full Name</span>
                <span className="text-secondary font-bold text-md">{currentUser?.full_name || 'Admin User'}</span>
              </div>

              <div className="flex-col gap-xs">
                <span className="text-sm text-secondary-light font-medium uppercase tracking-wider">Email Address</span>
                <span className="text-secondary font-bold text-md">{currentUser?.email || 'admin@freightflow.com'}</span>
              </div>

              <div className="flex-col gap-xs">
                <span className="text-sm text-secondary-light font-medium uppercase tracking-wider">Role</span>
                <span className="badge-purple" style={{ width: 'fit-content' }}>
                  {currentUser?.role?.replace('_', ' ') || 'SUPER ADMIN'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Preferences Section */}
          <motion.div variants={itemVariants} className="settings-card bg-surface border-light rounded-lg shadow-sm p-xl mb-lg">
            <div className="flex align-center gap-sm mb-lg border-b-light pb-sm">
              <div className="bg-primary-light p-xs rounded-md">
                <Layout size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold m-0 text-secondary">Display Preferences</h3>
            </div>

            <div className="preferences-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="preference-item flex justify-between align-center flex-wrap gap-md">
                <div>
                  <h4 className="m-0 text-md font-semibold text-secondary">Navigation Layout</h4>
                  <p className="text-sm text-secondary-light m-0 mt-xs">Choose how you want to navigate the application.</p>
                </div>
                <div className="flex bg-background border-light rounded-md p-xs gap-xs">
                  <button
                    className={`btn flex align-center gap-xs ${navMode === 'sidebar' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary hover:bg-surface'} border-none transition-all duration-200`}
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => handleNavModeChange('sidebar')}
                  >
                    <SidebarIcon size={16} /> Sidebar
                  </button>
                  <button
                    className={`btn flex align-center gap-xs ${navMode === 'menubar' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary hover:bg-surface'} border-none transition-all duration-200`}
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => handleNavModeChange('menubar')}
                  >
                    <Grip size={16} /> Menu bar
                  </button>
                  <button
                    className={`btn flex align-center gap-xs ${navMode === 'both' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary hover:bg-surface'} border-none transition-all duration-200`}
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => handleNavModeChange('both')}
                  >
                    <AppWindow size={16} /> Both
                  </button>
                </div>
              </div>

              <div className="preference-item flex justify-between align-center border-t-light pt-lg flex-wrap gap-md">
                <div>
                  <h4 className="m-0 text-md font-semibold text-secondary">Default List View</h4>
                  <p className="text-sm text-secondary-light m-0 mt-xs">Choose how you want to view lists of data by default.</p>
                </div>
                <div className="flex bg-background border-light rounded-md p-xs gap-xs">
                  <button
                    className={`btn flex align-center gap-xs ${viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary hover:bg-surface'} border-none transition-all duration-200`}
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => {
                      setViewMode('table');
                      localStorage.setItem('preferredViewMode', 'table');
                    }}
                  >
                    <Table size={16} /> Table
                  </button>
                  {/* <button 
                    className={`btn flex align-center gap-xs ${viewMode === 'card' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary hover:bg-surface'} border-none transition-all duration-200`} 
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => {
                      setViewMode('card');
                      localStorage.setItem('preferredViewMode', 'card');
                    }}
                  >
                    <CreditCard size={16} /> Card
                  </button> */}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-xl pt-md flex justify-end">
            <Button variant="primary" onClick={handleSave} leftIcon={Save} isLoading={isSaving} className="shadow-sm">
              Save Settings
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .settings-card {
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
          padding: 2rem;
          margin-bottom: 1.5rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .settings-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03);
        }

        .flex-col {
          display: flex;
          flex-direction: column;
        }

        .gap-xl {
          gap: 2rem;
        }
        
        .border-b-light {
          border-bottom: 1px solid var(--color-border, #e2e8f0);
        }
        
        .border-t-light {
          border-top: 1px solid var(--color-border, #e2e8f0);
        }
        
        .pb-sm {
          padding-bottom: 0.75rem;
        }
        
        .pt-lg {
          padding-top: 1.5rem;
        }
        
        .mb-lg {
          margin-bottom: 1.5rem;
        }
        
        .p-xl {
          padding: 2rem;
        }

        .bg-primary-light {
          background-color: rgba(var(--color-primary-rgb, 14, 165, 233), 0.1);
        }
      `}</style>
    </Page>
  );
};

export default Settings;
