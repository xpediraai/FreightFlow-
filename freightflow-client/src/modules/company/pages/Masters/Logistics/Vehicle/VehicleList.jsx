import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const VehicleList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getVehicles();
      let vehicleData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        vehicleData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        vehicleData = data.data;
      } else if (Array.isArray(data)) {
        vehicleData = data;
      }
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (vehicle.vehicle_number && vehicle.vehicle_number.toLowerCase().includes(query)) ||
      (vehicle.vehicle_type && vehicle.vehicle_type.toLowerCase().includes(query)) ||
      (vehicle.registration_number && vehicle.registration_number.toLowerCase().includes(query))
    );
  });

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
        {filteredVehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(vehicle)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold uppercase">{vehicle.vehicle_number}</h4>
              <Badge variant={vehicle.status === 'Active' ? 'success' : 'danger'}>{vehicle.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Type: {vehicle.vehicle_type || '-'} | Cap: {vehicle.vehicle_capacity ? `${vehicle.vehicle_capacity} kg` : '-'}</p>
            {vehicle.vehicle_owner && <p className="text-secondary-light text-sm mb-xs">Owner: {vehicle.vehicle_owner}</p>}
            <p className="text-secondary-light text-sm mt-xs">
              <Badge variant={vehicle.gps_enabled === 'Yes' ? 'success' : 'neutral'}>GPS: {vehicle.gps_enabled || 'No'}</Badge>
            </p>
          </div>
        ))}
        {filteredVehicles.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No vehicles found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredVehicles}
        isLoading={isLoading}
        emptyStateMsg="No vehicles found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default VehicleList;
