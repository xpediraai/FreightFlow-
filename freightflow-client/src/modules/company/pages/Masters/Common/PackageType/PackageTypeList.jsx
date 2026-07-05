import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { commonService } from '../../../../../masters/services/common.service';

const PackageTypeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [packageTypes, setPackageTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPackageTypes();
  }, [refreshTrigger, page, limit, searchQuery]);

  const fetchPackageTypes = async () => {
    setIsLoading(true);
    try {
      const data = await commonService.getPackageTypes({ page, limit, search: searchQuery });
      let typeData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        typeData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        typeData = data.data;
      } else if (Array.isArray(data)) {
        typeData = data;
      }
      setPackageTypes(typeData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch package types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  const columns = [
    {
      header: 'Package Type Code',
      key: 'package_type_code',
      render: (row) => <span className="font-medium">{row.package_type_code}</span>
    },
    {
      header: 'Package Type Name',
      key: 'package_type_name',
      render: (row) => row.package_type_name
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
            title="Edit Package Type"
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
        {packageTypes.map(type => (
          <div key={type.id}>
            <MasterDataCard
              title={type.package_type_name}
              code={type.package_type_code}
              status={type.status}
              onEdit={() => onEdit && onEdit(type)}
              
            />
          </div>
        ))}
        {packageTypes.length === 0 && !isLoading && (
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
        data={packageTypes}
        isLoading={isLoading}
        emptyStateMsg="No package types found. Create one to get started."
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

export default PackageTypeList;
