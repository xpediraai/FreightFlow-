import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { organizationService } from '../../../../../masters/services/organization.service';

const DepartmentList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, [refreshTrigger]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await organizationService.getDepartments();
      let deptData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        deptData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        deptData = data.data;
      } else if (Array.isArray(data)) {
        deptData = data;
      }
      setDepartments(deptData);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (dept.department_name && dept.department_name.toLowerCase().includes(query)) ||
      (dept.department_code && dept.department_code.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Dept Code',
      key: 'department_code',
      render: (row) => <span className="font-medium uppercase">{row.department_code}</span>
    },
    {
      header: 'Department Name',
      key: 'department_name',
      render: (row) => row.department_name
    },
    {
      header: 'Description',
      key: 'description',
      render: (row) => row.description || '-'
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
            title="Edit Department"
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
        {filteredDepartments.map(dept => (
          <div key={dept.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(dept)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{dept.department_name}</h4>
              <Badge variant={dept.status === 'Active' ? 'success' : 'danger'}>{dept.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: <span className="uppercase">{dept.department_code}</span></p>
            {dept.description && <p className="text-secondary-light text-sm">{dept.description}</p>}
          </div>
        ))}
        {filteredDepartments.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No departments found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredDepartments}
        isLoading={isLoading}
        emptyStateMsg="No departments found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default DepartmentList;
