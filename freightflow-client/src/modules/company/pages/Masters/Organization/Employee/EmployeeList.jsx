import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { organizationService } from '../../../../../masters/services/organization.service';

const EmployeeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await organizationService.getEmployees();
      let empData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        empData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        empData = data.data;
      } else if (Array.isArray(data)) {
        empData = data;
      }
      setEmployees(empData);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim().toLowerCase();
    return (
      fullName.includes(query) ||
      (emp.employee_code && emp.employee_code.toLowerCase().includes(query)) ||
      (emp.email && emp.email.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Code',
      key: 'employee_code',
      render: (row) => <span className="font-medium uppercase">{row.employee_code}</span>
    },
    {
      header: 'Name',
      key: 'name',
      render: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim()
    },
    {
      header: 'Email',
      key: 'email',
      render: (row) => row.email || '-'
    },
    {
      header: 'Mobile',
      key: 'mobile',
      render: (row) => row.mobile || '-'
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'danger'}>
          {row.status || 'Active'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-xs" onClick={(e) => e.stopPropagation()}>
          <button 
            className="action-btn edit-btn"
            onClick={() => onEdit && onEdit(row)}
            title="Edit Employee"
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="action-btn delete-btn"
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (viewMode === 'card') {
    return (
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredEmployees.map(emp => (
          <div key={emp.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(emp)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{`${emp.first_name || ''} ${emp.last_name || ''}`.trim()}</h4>
              <Badge variant={emp.status === 'Active' ? 'success' : 'danger'}>{emp.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: <span className="uppercase">{emp.employee_code}</span></p>
            {emp.email && <p className="text-secondary-light text-sm mb-xs">{emp.email}</p>}
            {emp.mobile && <p className="text-secondary-light text-sm">{emp.mobile}</p>}
          </div>
        ))}
        {filteredEmployees.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No employees found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredEmployees}
        isLoading={isLoading}
        emptyStateMsg="No employees found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default EmployeeList;
