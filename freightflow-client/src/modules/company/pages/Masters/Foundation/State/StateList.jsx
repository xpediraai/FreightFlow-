import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../../shared/components/Master/MasterDataCard';
import { Eye, Edit2, Trash2, MapPin } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const StateList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [states, setStates] = useState([]);
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
      await foundationService.deleteState(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setStates(prev => prev.filter(item => item.id !== itemToDelete.id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };


  useEffect(() => {
    fetchStates();
  }, [refreshTrigger]);
  const fetchStates = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getStates({ page: 1, limit: 10000 });
      let stateData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        stateData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        stateData = data.data;
      } else if (Array.isArray(data)) {
        stateData = data;
      }
      setStates(stateData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  
  const filteredList = states.filter(item => {
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
      header: 'State Code',
      key: 'state_code',
      render: (row) => <span className="font-medium">{row.state_code}</span>
    },
    {
      header: 'State Name',
      key: 'state_name',
      render: (row) => row.state_name
    },
    {
      header: 'Country',
      key: 'country',
      render: (row) => row.country?.country_name || row.Country?.country_name || '-'
    },
    {
      header: 'GST State Code',
      key: 'gst_state_code',
      render: (row) => row.gst_state_code || '-'
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
            title="Edit State"
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
        {paginatedList.map(state => (
          <div key={state.id}>
            <MasterDataCard
              title={state.state_name}
              code={state.state_code}
              status={state.status}
              locationText={state.country?.country_name || state.Country?.country_name || 'Worldwide'}
              locationIcon={MapPin}
              onEdit={() => onEdit && onEdit(state)}
              gridData={[
                { label: 'GST State Code', value: state.gst_state_code }
              ]}
            />
          </div>
        ))}
        {paginatedList.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No states found.
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? itemToDelete.state_name || itemToDelete.name || itemToDelete.code : ''}
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
        emptyStateMsg="No states found. Create one to get started."
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
        itemName={itemToDelete ? itemToDelete.state_name || itemToDelete.name || itemToDelete.code : ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default StateList;
