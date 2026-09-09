import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
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
      const targetId = itemToDelete.id || itemToDelete.mode_code;
      if (targetId) {
        try {
          await commonService.deleteTransportMode(targetId);
        } catch (err) {
          console.warn('API delete failed, removing locally:', err);
        }
      }

      const isMatch = (item) => {
        if (!item || !itemToDelete) return false;
        if (item.id && itemToDelete.id && String(item.id) === String(itemToDelete.id)) return true;
        if (item.mode_code && itemToDelete.mode_code && String(item.mode_code).toLowerCase() === String(itemToDelete.mode_code).toLowerCase()) return true;
        if (item.mode_name && itemToDelete.mode_name && String(item.mode_name).toLowerCase() === String(itemToDelete.mode_name).toLowerCase()) return true;
        return false;
      };

      try {
        const localRaw = localStorage.getItem('freightflow_transport_modes');
        if (localRaw) {
          const localList = JSON.parse(localRaw);
          const updated = localList.filter(item => !isMatch(item));
          localStorage.setItem('freightflow_transport_modes', JSON.stringify(updated));
        }
      } catch (lErr) {}

      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setModes(prev => prev.filter(item => !isMatch(item)));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchModes();
  }, [refreshTrigger]);

  const fetchModes = async () => {
    setIsLoading(true);
    try {
      let modeData = [];
      try {
        const data = await commonService.getTransportModes();
        if (data?.data?.data && Array.isArray(data.data.data)) {
          modeData = data.data.data;
        } else if (data?.data && Array.isArray(data.data)) {
          modeData = data.data;
        } else if (Array.isArray(data)) {
          modeData = data;
        }
      } catch (apiErr) {
        console.warn('API getTransportModes failed, loading local fallback:', apiErr);
      }

      let localData = [];
      try {
        const local = localStorage.getItem('freightflow_transport_modes');
        if (local) localData = JSON.parse(local);
      } catch (lErr) {}

      if (!Array.isArray(modeData) || modeData.length === 0) {
        modeData = localData.length > 0 ? localData : [
          { id: 'tm_1', mode_code: 'AIR', mode_name: 'Air Freight', description: 'Express International Air Cargo Transport', status: 'Active' },
          { id: 'tm_2', mode_code: 'SEA', mode_name: 'Ocean Freight (FCL/LCL)', description: 'Containerized & Breakbulk Marine Shipping', status: 'Active' }
        ];
      } else if (Array.isArray(localData) && localData.length > 0) {
        const backendCodes = new Set(modeData.map(m => String(m.mode_code || m.id).toLowerCase()));
        const newLocalItems = localData.filter(m => !backendCodes.has(String(m.mode_code || m.id).toLowerCase()));
        modeData = [...newLocalItems, ...modeData];
      }

      setModes(modeData);
    } catch (error) {
      console.error('Failed to fetch transport modes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  
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
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {paginatedList.map(mode => (
          <div key={mode.id}>
            <MasterDataCard
              title={mode.mode_name}
              code={mode.mode_code}
              status={mode.status}
              onEdit={() => onEdit && onEdit(mode)}
              
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
