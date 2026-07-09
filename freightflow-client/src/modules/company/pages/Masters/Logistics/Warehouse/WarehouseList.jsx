import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const WarehouseList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, [refreshTrigger]);
  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getWarehouses({ page: 1, limit: 10000 });
      let whData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        whData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        whData = data.data;
      } else if (Array.isArray(data)) {
        whData = data;
      }
      setWarehouses(whData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  
  const filteredList = warehouses.filter(item => {
    if (statusFilter === 'ALL STATUS') return true;
    const isMatch = statusFilter === 'ACTIVE' ? item.status === 'Active' : (item.status === 'Inactive' || item.status !== 'Active');
    return isMatch;
  });

  
  const calculatedTotalRecords = filteredList.length;
  const calculatedTotalPages = Math.ceil(calculatedTotalRecords / limit) || 1;
  const paginatedList = filteredList.slice((page - 1) * limit, page * limit);

  
  useEffect(() => {
    if (onTotalCountChange) {
      onTotalCountChange(calculatedTotalRecords);
    }
  }, [calculatedTotalRecords, onTotalCountChange]);

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
        {paginatedList.map(wh => (
          <div key={wh.id}>
            <MasterDataCard
              title={wh.warehouse_name}
              code={wh.warehouse_code}
              subtitle={wh.warehouse_type || 'General'}
              status={wh.status}
              onEdit={() => onEdit && onEdit(wh)}
              gridData={[
                { label: 'Contact', value: wh.contact_person },
                { label: 'Mobile', value: wh.mobile }
              ]}
            />
          </div>
        ))}
        {paginatedList.length === 0 && !isLoading && (
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
        data={paginatedList}
        isLoading={isLoading}
        emptyStateMsg="No warehouses found. Create one to get started."
        paginationProps={{
          currentPage: page,
          totalPages: calculatedTotalPages,
          onPageChange: setPage,
          totalItems: calculatedTotalRecords,
          itemsPerPage: limit,
          onLimitChange: (newLimit) => { setLimit(newLimit); setPage(1); }
        }}
        onRowClick={(row) => onEdit && onEdit(row)}
      />
);
};

export default WarehouseList;
