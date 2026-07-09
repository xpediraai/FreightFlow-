import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const VehicleList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [vehicles, setVehicles] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger]);
  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getVehicles({ page: 1, limit: 10000 });
      let vehicleData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        vehicleData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        vehicleData = data.data;
      } else if (Array.isArray(data)) {
        vehicleData = data;
      }
      setVehicles(vehicleData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  
  const filteredList = vehicles.filter(item => {
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
      header: 'Vehicle Number',
      key: 'vehicle_number',
      render: (row) => <span className="font-medium uppercase">{row.vehicle_number}</span>
    },
    {
      header: 'Type',
      key: 'vehicle_type',
      render: (row) => row.vehicle_type || '-'
    },
    {
      header: 'Owner',
      key: 'vehicle_owner',
      render: (row) => row.vehicle_owner || '-'
    },
    {
      header: 'Capacity (kg)',
      key: 'vehicle_capacity',
      render: (row) => row.vehicle_capacity || '-'
    },
    {
      header: 'GPS',
      key: 'gps_enabled',
      render: (row) => (
        <Badge variant={row.gps_enabled === 'Yes' ? 'success' : 'neutral'}>
          {row.gps_enabled || 'No'}
        </Badge>
      )
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
            title="Edit Vehicle"
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
        {paginatedList.map(vehicle => (
          <div key={vehicle.id}>
            <MasterDataCard
              title={vehicle.vehicle_number}
              code={vehicle.code}
              status={vehicle.status}
              onEdit={() => onEdit && onEdit(vehicle)}
              gridData={[
                { label: 'Type', value: vehicle.vehicle_type || '-' },
                { label: 'Capacity', value: vehicle.vehicle_capacity ? `${vehicle.vehicle_capacity} kg` : '-' },
                { label: 'Owner', value: vehicle.vehicle_owner }
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
        emptyStateMsg="No vehicles found. Create one to get started."
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

export default VehicleList;
