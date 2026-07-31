import React, { useState, useEffect } from 'react';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import JobList from './JobList';
import { Search, LayoutGrid, List } from 'lucide-react';
import { organizationService } from '../../../../masters/services/organization.service';

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [viewMode, setViewMode] = useState(localStorage.getItem('preferredJobViewMode') || 'grid');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await organizationService.getEmployees({ page: 1, limit: 1000 });
      let data = [];
      if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      }
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees filter:', err);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('preferredJobViewMode', mode);
  };

  return (
    <Page>
      <PageHeader 
        title="Job Management"
        subtitle="Track operational jobs, tasks, priorities, and assigned personnel"
      />
      
      <div className="mt-lg">
        <div className="bg-surface border-light rounded-lg shadow-sm">
          {/* TOOLBAR ALIGNMENT HEADER */}
          <div className="p-md border-b-light flex flex-wrap items-center justify-between gap-md">
            <div className="flex items-center gap-md">
              <span className="font-bold text-secondary text-sm">
                Total Job: {totalRecords}
              </span>

              {/* PREMIUM SEGMENTED VIEW MODE SWITCHER */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '10px', 
                  padding: '3px',
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)'
                }}
              >
                <button
                  type="button"
                  onClick={() => handleViewModeChange('grid')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                    color: viewMode === 'grid' ? '#dc2626' : '#6b7280',
                    boxShadow: viewMode === 'grid' ? '0 2px 5px rgba(0, 0, 0, 0.08)' : 'none'
                  }}
                  title="Card Grid View"
                >
                  <LayoutGrid size={15} style={{ color: viewMode === 'grid' ? '#dc2626' : '#6b7280' }} /> Grid Cards
                </button>

                <button
                  type="button"
                  onClick={() => handleViewModeChange('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                    color: viewMode === 'table' ? '#dc2626' : '#6b7280',
                    boxShadow: viewMode === 'table' ? '0 2px 5px rgba(0, 0, 0, 0.08)' : 'none'
                  }}
                  title="Table View"
                >
                  <List size={15} style={{ color: viewMode === 'table' ? '#dc2626' : '#6b7280' }} /> Table View
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-sm" style={{ flex: '1 1 auto', justifyContent: 'flex-end' }}>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control form-control-sm"
                style={{ width: '140px' }}
              >
                <option value="ALL STATUS">ALL STATUS</option>
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
                <option value="On-Hold">On-Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select 
                className="form-control form-control-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ width: '130px' }}
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>

              <select 
                className="form-control form-control-sm"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="">All Employees</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.first_name ? `${e.first_name} ${e.last_name || ''}` : (e.employee_name || e.name)}</option>
                ))}
              </select>

              <div className="search-input-wrapper relative" style={{ width: '220px' }}>
                <Search size={16} className="text-secondary-light absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control form-control-sm w-full"
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>
          </div>

          <JobList 
            searchQuery={searchTerm}
            viewMode={viewMode}
            refreshTrigger={refreshTrigger}
            onTotalCountChange={setTotalRecords}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            employeeFilter={employeeFilter}
          />
        </div>
      </div>
    </Page>
  );
};

export default Jobs;
