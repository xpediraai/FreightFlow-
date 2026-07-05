import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const WarehouseList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, [refreshTrigger]);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getWarehouses();
      let whData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        whData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        whData = data.data;
      } else if (Array.isArray(data)) {
        whData = data;
      }
      setWarehouses(whData);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWarehouses = warehouses.filter(wh => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (wh.warehouse_name && wh.warehouse_name.toLowerCase().includes(query)) ||
      (wh.warehouse_code && wh.warehouse_code.toLowerCase().includes(query)) ||
      (wh.warehouse_type && wh.warehouse_type.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'WH Code',
      key: 'warehouse_code',
      render: (row) => <span className="font-medium">{row.warehouse_code}</span>
    },
    {
      header: 'WH Name',
      key: 'warehouse_name',
      render: (row) => row.warehouse_name
    },
    {
      header: 'Type',
      key: 'warehouse_type',
      render: (row) => row.warehouse_type || '-'
    },
    {
      header: 'Contact Person',
      key: 'contact_person',
      render: (row) => row.contact_person || '-'
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
            title="Edit Warehouse"
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
        {filteredWarehouses.map(wh => (
          <div key={wh.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(wh)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{wh.warehouse_name}</h4>
              <Badge variant={wh.status === 'Active' ? 'success' : 'danger'}>{wh.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {wh.warehouse_code} {wh.warehouse_type ? `| Type: ${wh.warehouse_type}` : ''}</p>
            {wh.contact_person && <p className="text-secondary-light text-sm mb-xs">Contact: {wh.contact_person}</p>}
            {wh.mobile && <p className="text-secondary-light text-sm">Mobile: {wh.mobile}</p>}
          </div>
        ))}
        {filteredWarehouses.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No warehouses found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredWarehouses}
        isLoading={isLoading}
        emptyStateMsg="No warehouses found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default WarehouseList;
