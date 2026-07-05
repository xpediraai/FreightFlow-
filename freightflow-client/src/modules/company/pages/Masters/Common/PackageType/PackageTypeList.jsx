import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { commonService } from '../../../../../masters/services/common.service';

const PackageTypeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [packageTypes, setPackageTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPackageTypes();
  }, [refreshTrigger]);

  const fetchPackageTypes = async () => {
    setIsLoading(true);
    try {
      const data = await commonService.getPackageTypes();
      let typeData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        typeData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        typeData = data.data;
      } else if (Array.isArray(data)) {
        typeData = data;
      }
      setPackageTypes(typeData);
    } catch (error) {
      console.error('Failed to fetch package types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTypes = packageTypes.filter(type => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (type.package_type_name && type.package_type_name.toLowerCase().includes(query)) ||
      (type.package_type_code && type.package_type_code.toLowerCase().includes(query))
    );
  });

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
        {filteredTypes.map(type => (
          <div key={type.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(type)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{type.package_type_name}</h4>
              <Badge variant={type.status === 'Active' ? 'success' : 'danger'}>{type.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {type.package_type_code}</p>
            <p className="text-secondary-light text-sm">{type.description || '-'}</p>
          </div>
        ))}
        {filteredTypes.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No package types found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredTypes}
        isLoading={isLoading}
        emptyStateMsg="No package types found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default PackageTypeList;
