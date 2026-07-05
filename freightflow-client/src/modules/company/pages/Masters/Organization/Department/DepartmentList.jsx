import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { organizationService } from '../../../../../masters/services/organization.service';

const DepartmentList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, [refreshTrigger, page, limit, searchQuery]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await organizationService.getDepartments({ page, limit, search: searchQuery });
      let deptData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        deptData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        deptData = data.data;
      } else if (Array.isArray(data)) {
        deptData = data;
      }
      setDepartments(deptData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

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
        {departments.map(dept => (
          <div key={dept.id}>
            <MasterDataCard
              title={dept.department_name}
              code={dept.department_code}
              status={dept.status}
              onEdit={() => onEdit && onEdit(dept)}
              
            />
          </div>
        ))}
        {departments.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No records found.
          </div>
        )}
      </div>
    );
  }

  return (
    <TableView
        columns={columns}
        data={departments}
        isLoading={isLoading}
        emptyStateMsg="No departments found. Create one to get started."
        paginationProps={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
          totalItems: totalRecords,
          itemsPerPage: limit,
          onLimitChange: (newLimit) => { setLimit(newLimit); setPage(1); }
        }}
        onRowClick={(row) => onEdit && onEdit(row)}
      />
);
};

export default DepartmentList;
