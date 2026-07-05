import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const DriverList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [drivers, setDrivers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, [refreshTrigger, page, limit, searchQuery]);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getDrivers({ page, limit, search: searchQuery });
      let driverData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        driverData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        driverData = data.data;
      } else if (Array.isArray(data)) {
        driverData = data;
      }
      setDrivers(driverData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

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
        {drivers.map(driver => (
          <div key={driver.id}>
            <MasterDataCard
              title={driver.driver_name}
              code={driver.driver_code}
              status={driver.status}
              onEdit={() => onEdit && onEdit(driver)}
              gridData={[
                { label: 'Mobile', value: driver.mobile },
                { label: 'License', value: driver.license_number }
              ]}
            />
          </div>
        ))}
        {drivers.length === 0 && !isLoading && (
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
        data={drivers}
        isLoading={isLoading}
        emptyStateMsg="No drivers found. Create one to get started."
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

export default DriverList;
