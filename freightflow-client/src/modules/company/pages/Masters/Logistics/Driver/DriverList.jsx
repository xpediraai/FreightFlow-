import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const DriverList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0, onTotalCountChange, statusFilter = 'ALL STATUS' }) => {
  const [drivers, setDrivers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await logisticsService.deleteDriver(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setDrivers(prev => prev.filter(item => item.id !== itemToDelete.id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };


  useEffect(() => {
    fetchDrivers();
  }, [refreshTrigger]);
  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getDrivers({ page: 1, limit: 10000 });
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




  const filteredList = drivers.filter(item => {
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
            title="Delete"
            onClick={() => handleDeleteClick(row)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (viewMode === 'card') {
    return (
    <>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {paginatedList.map(driver => (
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
        {paginatedList.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No records found.
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? itemToDelete.driver_name || itemToDelete.name || itemToDelete.code : ''}
        isDeleting={isDeleting}
      />
    </>
  );
  }

  return (
    <>
    <TableView
      columns={columns}
      data={paginatedList}
      isLoading={isLoading}
      emptyStateMsg="No drivers found. Create one to get started."
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
  
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? itemToDelete.driver_name || itemToDelete.name || itemToDelete.code : ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default DriverList;
