import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../../shared/components/Master/MasterDataCard';
import MasterLoader from '../../../../../../shared/components/Master/MasterLoader';
import { Edit2, Trash2 } from 'lucide-react';
import { commonService } from '../../../../../masters/services/common.service';

const TransportModeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [modes, setModes] = useState([]);
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
      await commonService.deleteTransportMode(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setModes(prev => prev.filter(item => item.id !== itemToDelete.id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchTransportModes = async () => {
    setIsLoading(true);
    try {
      const data = await commonService.getTransportModes({ page: 1, limit: 10000 });
      let modeData = [];
      if (data?.data?.rows && Array.isArray(data.data.rows)) {
        modeData = data.data.rows;
      } else if (data?.data?.data && Array.isArray(data.data.data)) {
        modeData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        modeData = data.data;
      } else if (Array.isArray(data)) {
        modeData = data;
      } else if (data?.rows && Array.isArray(data.rows)) {
        modeData = data.rows;
      }
      setModes(modeData);
      const totalCount = data?.data?.total || data?.data?.count || data?.total || modeData.length;
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (totalCount) setTotalRecords(totalCount);
    } catch (error) {
      console.error('Failed to fetch transport modes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportModes();
  }, [refreshTrigger]);

  const filteredList = modes.filter(item => {
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

  if (viewMode === 'card' && isLoading) {
    return <MasterLoader type="card" />;
  }

  const columns = [
    {
      header: 'Mode Code',
      key: 'mode_code',
      render: (row) => <span className="font-medium">{row.mode_code}</span>
    },
    {
      header: 'Mode Name',
      key: 'mode_name',
      render: (row) => row.mode_name
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
            title="Edit Transport Mode"
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', padding: '16px' }}>
        {paginatedList.map(mode => (
          <div key={mode.id}>
            <MasterDataCard
              title={mode.mode_name}
              code={mode.mode_code}
              status={mode.status}
              onEdit={() => onEdit && onEdit(mode)}
              onDelete={() => handleDeleteClick(mode)}
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
        itemName={itemToDelete ? itemToDelete.mode_name || itemToDelete.name || itemToDelete.code : ''}
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
        emptyStateMsg="No transport modes found. Create one to get started."
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
        itemName={itemToDelete ? itemToDelete.mode_name || itemToDelete.name || itemToDelete.code : ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default TransportModeList;
