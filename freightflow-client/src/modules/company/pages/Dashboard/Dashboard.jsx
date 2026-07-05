import React from 'react';
import Page from '../../../../shared/components/Page';
import PageHeader from '../../../../shared/components/PageHeader';
import { useAuth } from '../../../../contexts/AuthContext';
import { Activity, Clock, FileText, Settings, Zap } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <Page>
      <PageHeader
        title="Company Dashboard"
        subtitle="Welcome to your FreightFlow ERP Company overview."
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <div className="dashboard-grid mt-lg" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Welcome Card */}
        <div className="dashboard-card bg-surface border-light rounded-lg shadow-sm p-xl" style={{ gridColumn: '1 / -1' }}>
          <div className="flex align-center gap-md">
            <div className="avatar bg-primary-light text-primary rounded-full flex justify-center align-center" style={{ width: '48px', height: '48px', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {currentUser?.full_name?.charAt(0) || 'O'}
            </div>
            <div>
              <h3 className="text-xl font-bold m-0">Welcome back, {currentUser?.full_name || 'Owner'}!</h3>
              <p className="text-secondary-light m-0 mt-xs">Here is a quick overview of your company's operations.</p>
            </div>
          </div>
        </div>


      </div>

      <style>{`
        .dashboard-card {
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 1.5rem;
        }
        .bg-primary-light { background-color: var(--color-primary-light, #e0e7ff); }
        .text-primary { color: var(--color-primary, #4f46e5); }
      `}</style>
    </Page>
  );
};

export default Dashboard;
