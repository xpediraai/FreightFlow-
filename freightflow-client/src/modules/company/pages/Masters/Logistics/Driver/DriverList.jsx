import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const DriverList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, [refreshTrigger]);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getDrivers();
      let driverData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        driverData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        driverData = data.data;
      } else if (Array.isArray(data)) {
        driverData = data;
      }
      setDrivers(driverData);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (driver.driver_name && driver.driver_name.toLowerCase().includes(query)) ||
      (driver.driver_code && driver.driver_code.toLowerCase().includes(query)) ||
      (driver.mobile && driver.mobile.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Driver Code',
      key: 'driver_code',
      render: (row) => <span className="font-medium uppercase">{row.driver_code}</span>
    },
    {
      header: 'Driver Name',
      key: 'driver_name',
      render: (row) => row.driver_name
    },
    {
      header: 'Mobile',
      key: 'mobile',
      render: (row) => row.mobile || '-'
    },
    {
      header: 'License No',
      key: 'license_number',
      render: (row) => <span className="uppercase">{row.license_number || '-'}</span>
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
            title="Edit Driver"
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
        {filteredDrivers.map(driver => (
          <div key={driver.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(driver)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{driver.driver_name}</h4>
              <Badge variant={driver.status === 'Active' ? 'success' : 'danger'}>{driver.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: <span className="uppercase">{driver.driver_code}</span></p>
            {driver.mobile && <p className="text-secondary-light text-sm mb-xs">Mobile: {driver.mobile}</p>}
            {driver.license_number && <p className="text-secondary-light text-sm">License: <span className="uppercase">{driver.license_number}</span></p>}
          </div>
        ))}
        {filteredDrivers.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No drivers found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredDrivers}
        isLoading={isLoading}
        emptyStateMsg="No drivers found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default DriverList;
