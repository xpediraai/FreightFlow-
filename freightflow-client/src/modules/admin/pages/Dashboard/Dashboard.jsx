import React, { useEffect, useState } from 'react';
import { Building2, Users, UserCircle, Briefcase } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import DashboardCard from '../../../../shared/components/DashboardCard';
import Page from '../../../../shared/components/Page';
import PageHeader from '../../../../shared/components/PageHeader';
import { adminService } from '../../services/admin.service';
import Loader from '../../../../shared/components/Loader';
import './Dashboard.css';

const mockChartData = [
  { name: 'Jan', companies: 10, employees: 400 },
  { name: 'Feb', companies: 25, employees: 900 },
  { name: 'Mar', companies: 45, employees: 1200 },
  { name: 'Apr', companies: 65, employees: 2100 },
  { name: 'May', companies: 110, employees: 3000 },
  { name: 'Jun', companies: 142, employees: 4280 },
];

const mockEmployeeDist = [
  { name: 'Sales', count: 1200 },
  { name: 'Ops', count: 2000 },
  { name: 'HR', count: 300 },
  { name: 'Finance', count: 400 },
  { name: 'IT', count: 380 },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="p-xl flex justify-center"><Loader size={40} /></div>;
  }

  return (
    <Page>
      {/* <PageHeader
        title="Super Admin Dashboard"
      /> */}

      <div className="dashboard-grid">
        <DashboardCard
          title="Total Companies"
          value={stats?.totalCompanies || 0}
          icon={Building2}
        />
        <DashboardCard
          title="Active Companies"
          value={stats?.activeCompanies || 0}
          icon={Briefcase}
        />
        <DashboardCard
          title="Total Owners"
          value={stats?.totalOwners || 0}
          icon={UserCircle}
        />
        <DashboardCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
        />
      </div>

      <div className="dashboard-sections mt-xl">
        <div className="dashboard-charts-placeholder">
          <div className="chart-card">
            <h3>Company Growth</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <AreaChart data={stats?.chartData || mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--color-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="companies" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorCompanies)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* <div className="chart-card">
            <h3>Employee Distribution</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={stats?.employeeDist || mockEmployeeDist} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--color-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'var(--color-surface-hover)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div> */}
        </div>

        <div className="dashboard-recent-activity">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {stats?.recentActivity?.map(activity => (
              <li key={activity.id} className="activity-item">
                <div className="activity-indicator"></div>
                <div className="activity-content">
                  <p className="activity-action">{activity.action}</p>
                  <p className="activity-target">{activity.target}</p>
                </div>
                <span className="activity-time">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Page>
  );
};

export default Dashboard;
