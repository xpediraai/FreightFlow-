import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { commonService } from '../../../../../masters/services/common.service';

const ContainerTypeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContainers();
  }, [refreshTrigger]);

  const fetchContainers = async () => {
    setIsLoading(true);
    try {
      const data = await commonService.getContainerTypes();
      let containerData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        containerData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        containerData = data.data;
      } else if (Array.isArray(data)) {
        containerData = data;
      }
      setContainers(containerData);
    } catch (error) {
      console.error('Failed to fetch container types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContainers = containers.filter(container => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (container.container_name && container.container_name.toLowerCase().includes(query)) ||
      (container.container_code && container.container_code.toLowerCase().includes(query)) ||
      (container.iso_code && container.iso_code.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Code',
      key: 'container_code',
      render: (row) => <span className="font-medium">{row.container_code}</span>
    },
    {
      header: 'Name',
      key: 'container_name',
      render: (row) => row.container_name
    },
    {
      header: 'ISO Code',
      key: 'iso_code',
      render: (row) => row.iso_code
    },
    {
      header: 'Size',
      key: 'size',
      render: (row) => `${row.size}'`
    },
    {
      header: 'Category',
      key: 'category',
      render: (row) => row.category
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
            title="Edit Container Type"
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
        {filteredContainers.map(container => (
          <div key={container.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(container)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{container.container_name}</h4>
              <Badge variant={container.status === 'Active' ? 'success' : 'danger'}>{container.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {container.container_code} | ISO: {container.iso_code}</p>
            <p className="text-secondary-light text-sm mb-xs">Type: {container.size}' {container.category}</p>
            {container.capacity_cbm && <p className="text-secondary-light text-sm mb-xs">Capacity: {container.capacity_cbm} CBM</p>}
            {container.max_weight && <p className="text-secondary-light text-sm">Max Wt: {container.max_weight} kg</p>}
          </div>
        ))}
        {filteredContainers.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No container types found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredContainers}
        isLoading={isLoading}
        emptyStateMsg="No container types found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default ContainerTypeList;
