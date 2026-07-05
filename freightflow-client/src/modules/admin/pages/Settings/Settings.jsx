import React, { useState } from 'react';
import { Save, Shield, Bell, Globe, User, Layout, Sidebar as SidebarIcon, Table, CreditCard } from 'lucide-react';
import Page from '../../../../shared/components/Page';
import PageHeader from '../../../../shared/components/PageHeader';
import Button from '../../../../shared/components/Button';
import { useAuth } from '../../../../contexts/AuthContext';

const Settings = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <Page>
      <PageHeader 
        title="Platform Settings" 
        subtitle="Global configurations for the FreightFlow ERP platform." 
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Settings' }]}
        primaryAction={{ label: 'Save Changes', onClick: handleSave }}
      />
      
      <div className="settings-container mt-lg flex gap-xl" style={{ alignItems: 'flex-start' }}>
        
        {/* Sidebar Tabs */}
        <div className="settings-sidebar bg-surface border-light rounded-lg shadow-sm" style={{ width: '250px', flexShrink: 0 }}>
          <div className="p-sm">
            <button 
              className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Globe size={18} /> General
            </button>
            <button 
              className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={18} /> Security
            </button>
            <button 
              className={`settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} /> Notifications
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="settings-content flex-1 flex-col gap-xl">
          {activeTab === 'general' && (
            <>
              {/* Profile Section */}
              <div className="settings-card bg-surface border-light rounded-lg shadow-sm p-xl mb-lg">
                <div className="flex align-center gap-sm mb-lg border-b-light pb-sm">
                  <User size={20} className="text-primary" />
                  <h3 className="text-lg font-medium m-0">My Profile</h3>
                </div>
                
                <div className="profile-details" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem' }}>
                  <span className="text-secondary-light font-medium">Full Name:</span>
                  <span className="text-secondary font-bold">{currentUser?.full_name || 'Admin User'}</span>
                  
                  <span className="text-secondary-light font-medium">Email Address:</span>
                  <span className="text-secondary font-bold">{currentUser?.email || 'admin@freightflow.com'}</span>
                  
                  <span className="text-secondary-light font-medium">Role:</span>
                  <span className="badge-purple" style={{ width: 'fit-content' }}>
                    {currentUser?.role?.replace('_', ' ') || 'SUPER ADMIN'}
                  </span>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="settings-card bg-surface border-light rounded-lg shadow-sm p-xl mb-lg">
                <div className="flex align-center gap-sm mb-lg border-b-light pb-sm">
                  <Layout size={20} className="text-primary" />
                  <h3 className="text-lg font-medium m-0">Display Preferences</h3>
                </div>
                
                <div className="preferences-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="preference-item flex justify-between align-center">
                    <div>
                      <h4 className="m-0 text-md font-medium text-secondary">Sidebar Menu</h4>
                      <p className="text-sm text-secondary-light m-0 mt-xs">Toggle the left navigation sidebar open or closed by default.</p>
                    </div>
                    <button className="btn btn-primary flex align-center gap-xs">
                      <SidebarIcon size={16} /> Toggle Sidebar
                    </button>
                  </div>
                  
                  <div className="preference-item flex justify-between align-center border-t-light pt-md">
                    <div>
                      <h4 className="m-0 text-md font-medium text-secondary">Default List View</h4>
                      <p className="text-sm text-secondary-light m-0 mt-xs">Choose how you want to view lists of data.</p>
                    </div>
                    <div className="flex bg-background border-light rounded-md p-xs gap-xs">
                      <button className="btn flex align-center gap-xs bg-primary text-white border-none" style={{ padding: '0.4rem 1rem' }}>
                        <Table size={16} /> Table
                      </button>
                      <button className="btn flex align-center gap-xs bg-transparent text-secondary border-none shadow-none" style={{ padding: '0.4rem 1rem' }}>
                        <CreditCard size={16} /> Card
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className="settings-card bg-surface border-light rounded-lg shadow-sm p-xl mb-lg">
              <h3 className="text-lg font-medium m-0 mb-md border-b-light pb-sm">Security & Access</h3>
              <div className="form-group mt-md flex align-center justify-between" style={{ padding: '1rem', background: 'var(--color-background)', borderRadius: '8px' }}>
                <div>
                  <div className="font-medium">Enforce Two-Factor Authentication</div>
                  <div className="text-sm text-tertiary">Require 2FA for all new company owner accounts.</div>
                </div>
                <div className="toggle-switch">
                  <input type="checkbox" id="2fa" className="toggle-input" defaultChecked />
                  <label htmlFor="2fa" className="toggle-label"></label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-card bg-surface border-light rounded-lg shadow-sm p-xl mb-lg">
              <h3 className="text-lg font-medium m-0 mb-md border-b-light pb-sm">System Notifications</h3>
              <div className="form-group mt-md flex align-center justify-between" style={{ padding: '1rem', background: 'var(--color-background)', borderRadius: '8px' }}>
                <div>
                  <div className="font-medium">Email Alerts for New Companies</div>
                  <div className="text-sm text-tertiary">Send an email when a new company is created.</div>
                </div>
                <div className="toggle-switch">
                  <input type="checkbox" id="email-alerts" className="toggle-input" defaultChecked />
                  <label htmlFor="email-alerts" className="toggle-label"></label>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-xl pt-lg flex justify-end">
            <Button variant="primary" onClick={handleSave} leftIcon={Save} isLoading={isSaving}>Save Settings</Button>
          </div>
        </div>

      </div>

      <style>{`
        .settings-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .settings-tab-btn:hover {
          background: var(--color-surface-hover);
          color: var(--color-text-primary);
        }
        .settings-tab-btn.active {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }
        
        .settings-card {
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
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
          padding-bottom: 0.5rem;
        }
        
        .pt-md {
          padding-top: 1rem;
        }
        
        .mb-lg {
          margin-bottom: 1.5rem;
        }
        
        .p-xl {
          padding: 1.5rem;
        }

        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
        }
        .toggle-input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-label {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--color-border, #ccc);
          transition: .4s;
          border-radius: 24px;
        }
        .toggle-label:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        .toggle-input:checked + .toggle-label {
          background-color: var(--color-primary, #0056b3);
        }
        .toggle-input:checked + .toggle-label:before {
          transform: translateX(20px);
        }
      `}</style>
    </Page>
  );
};

export default Settings;
