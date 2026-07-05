import React, { useState, useEffect } from 'react';
import { User, ChevronDown, ChevronUp } from 'lucide-react';
import Page from '../../../../shared/components/Page';
import { adminService } from '../../services/admin.service';

const EmployeeOverview = () => {
  const [expandedUsers, setExpandedUsers] = useState({ 'u1': true });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats();
        setStats(response?.data || response || {});
      } catch (error) {
        console.error("Failed to fetch employee stats", error);
      }
    };
    fetchStats();
  }, []);

  const toggleUser = (userId) => {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const hierarchyData = stats?.hierarchy || [];

  // Automatically expand the first user once data loads if not already set
  useEffect(() => {
    if (hierarchyData.length > 0 && Object.keys(expandedUsers).length === 0) {
      setExpandedUsers({ [hierarchyData[0].id]: true });
    }
  }, [hierarchyData]);

  return (
    <Page>
      <div className="flex justify-between align-center mb-xl">
        <h2 className="text-2xl font-bold text-success m-0">Employee Statistics</h2>
      </div>
      
      <div className="flex justify-between align-center mb-lg">
        <div className="flex align-center gap-sm">
          <span className="text-secondary-light">Show</span>
          <select className="form-control" style={{ width: '70px', display: 'inline-block' }}>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span className="text-secondary-light">entries</span>
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Search users or companies..." 
            className="form-control"
            style={{ width: '250px' }}
          />
        </div>
      </div>

      <div className="employee-accordion-container">
        {hierarchyData.length === 0 ? (
          <div className="p-xl text-center text-tertiary border-light rounded-lg bg-surface">
            No company owners or data found.
          </div>
        ) : hierarchyData.map(user => (
          <div key={user.id} className="user-accordion-item bg-surface rounded-lg shadow-sm border-light mb-md">
            <div 
              className="user-accordion-header p-md flex justify-between align-center cursor-pointer"
              onClick={() => toggleUser(user.id)}
            >
              <div className="flex align-center gap-sm text-success font-medium">
                <User size={20} />
                <span className="text-lg">{user.name}</span>
              </div>
              <div className="flex align-center gap-md">
                <span className="badge-gray">{user.totalCompanies} Companies</span>
                <span className="badge-gray">{user.totalEmployees} Employees</span>
                {expandedUsers[user.id] ? <ChevronUp size={20} className="text-secondary-light" /> : <ChevronDown size={20} className="text-secondary-light" />}
              </div>
            </div>

            {expandedUsers[user.id] && (
              <div className="user-accordion-body p-md border-t-light bg-background">
                {user.companies.map(company => (
                  <div key={company.id} className="company-card bg-surface rounded-md border-light mb-md">
                    <div className="company-header p-md flex justify-between align-center border-b-light">
                      <h4 className="m-0 text-primary uppercase">{company.name}</h4>
                      <div className="flex gap-sm">
                        <span className="badge-purple">Total: {company.total}</span>
                        <span className="badge-green">Active: {company.active}</span>
                        <span className="badge-red">Inactive: {company.inactive}</span>
                      </div>
                    </div>
                    
                    <div className="company-body p-md">
                      <div className="department-grid">
                        {company.departments.map(dept => (
                          <div key={dept.id} className="department-card border-light rounded-md">
                            <div className="department-header p-sm border-b-light">
                              <span className="text-sm font-bold text-secondary uppercase">{dept.name}</span>
                            </div>
                            <div className="department-stats p-sm">
                              <div className="stat-row flex justify-between mb-xs">
                                <span className="text-secondary-light">Total:</span>
                                <span className="font-bold">{dept.total}</span>
                              </div>
                              <div className="stat-row flex justify-between mb-xs">
                                <span className="text-secondary-light">Active:</span>
                                <span className="font-bold text-success">{dept.active}</span>
                              </div>
                              <div className="stat-row flex justify-between">
                                <span className="text-secondary-light">Inactive:</span>
                                <span className="font-bold text-danger">{dept.inactive}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .badge-gray {
          background-color: #e2e8f0;
          color: #334155;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .badge-purple {
          background-color: #e0e7ff;
          color: #4f46e5;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .badge-green {
          background-color: #dcfce7;
          color: #16a34a;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .badge-red {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .department-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        .stat-row {
          font-size: 0.9rem;
        }
      `}</style>
    </Page>
  );
};

export default EmployeeOverview;
