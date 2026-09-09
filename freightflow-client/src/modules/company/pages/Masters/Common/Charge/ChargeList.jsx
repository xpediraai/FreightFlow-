import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { businessService } from '../../../../../masters/services/business.service';

const ChargeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [charges, setCharges] = useState([]);
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
      const targetId = itemToDelete.id || itemToDelete.charge_code;
      if (targetId) {
        try {
          await businessService.deleteCharge(targetId);
        } catch (err) {
          console.warn('API delete failed, deleting from local storage:', err);
        }
      }

      const isMatch = (item) => {
        if (!item || !itemToDelete) return false;
        if (item.id && itemToDelete.id && String(item.id) === String(itemToDelete.id)) return true;
        if (item.charge_code && itemToDelete.charge_code && String(item.charge_code).toLowerCase() === String(itemToDelete.charge_code).toLowerCase()) return true;
        return false;
      };
      
      try {
        const localRaw = localStorage.getItem('freightflow_charge_masters');
        if (localRaw) {
          const localList = JSON.parse(localRaw);
          const updated = localList.filter(item => !isMatch(item));
          localStorage.setItem('freightflow_charge_masters', JSON.stringify(updated));
        }
      } catch (lErr) {}

      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setCharges(prev => prev.filter(item => !isMatch(item)));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, [refreshTrigger]);

  const fetchCharges = async () => {
    setIsLoading(true);
    try {
      let data = [];
      try {
        const res = await businessService.getCharges();
        if (res?.data?.data?.data && Array.isArray(res.data.data.data)) {
          data = res.data.data.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        }
      } catch (apiErr) {
        console.warn('API getCharges failed, loading local storage fallback:', apiErr);
      }

      let localData = [];
      try {
        const local = localStorage.getItem('freightflow_charge_masters');
        if (local) localData = JSON.parse(local);
      } catch (lErr) {}

      if (!Array.isArray(data) || data.length === 0) {
        data = localData;
      } else if (Array.isArray(localData) && localData.length > 0) {
        const backendIds = new Set(data.map(item => String(item.id)));
        const newLocalItems = localData.filter(item => !backendIds.has(String(item.id)));
        data = [...newLocalItems, ...data];
      }

      setCharges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch charges:', error);
      setCharges([]);
    } finally {
      setIsLoading(false);
    }
  };

  

  
  const filteredList = charges.filter(item => {
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
      header: 'Code',
      key: 'charge_code',
      render: (row) => <span className="font-medium uppercase">{row.charge_code}</span>
    },
    {
      header: 'Charge Name / Service Description',
      key: 'charge_name',
      render: (row) => <strong>{row.charge_name}</strong>
    },
    {
      header: 'Basis / Unit',
      key: 'basis',
      render: (row) => row.basis || 'Per Container'
    },
    {
      header: 'Default Rate (₹)',
      key: 'default_rate',
      render: (row) => row.default_rate ? `₹${Number(row.default_rate).toLocaleString('en-IN')}` : '-'
    },
    {
      header: 'Type',
      key: 'charge_type',
      render: (row) => row.charge_type || '-'
    },
    {
      header: 'Module',
      key: 'applicable_module',
      render: (row) => row.applicable_module || '-'
    },
    {
      header: 'Taxable',
      key: 'tax_applicable',
      render: (row) => (
        <Badge variant={row.tax_applicable ? 'danger' : 'neutral'}>
          {row.tax_applicable ? 'Yes' : 'No'}
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
            title="Edit"
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
        {paginatedList.map(c => (
          <div key={c.id}>
            <MasterDataCard
              title={c.charge_name}
              code={c.charge_code}
              status={c.status}
              onEdit={() => onEdit && onEdit(c)}
              gridData={[
                { label: 'Type', value: c.charge_type },
                { label: 'Module', value: c.applicable_module }
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
        itemName={itemToDelete ? itemToDelete.charge_name || itemToDelete.name || itemToDelete.code : ''}
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
        emptyStateMsg="No charges found. Create one to get started."
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
        itemName={itemToDelete ? itemToDelete.charge_name || itemToDelete.name || itemToDelete.code : ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ChargeList;
