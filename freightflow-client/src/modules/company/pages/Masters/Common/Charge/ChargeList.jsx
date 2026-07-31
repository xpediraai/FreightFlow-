import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../../shared/components/Master/MasterDataCard';
import MasterLoader from '../../../../../../shared/components/Master/MasterLoader';
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
      await businessService.deleteCharge(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setCharges(prev => prev.filter(item => item.id !== itemToDelete.id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchCharges = async () => {
    setIsLoading(true);
    try {
      const res = await businessService.getCharges({ page: 1, limit: 10000 });
      let data = [];
      if (res?.data?.rows && Array.isArray(res.data.rows)) {
        data = res.data.rows;
      } else if (res?.data?.data?.data && Array.isArray(res.data.data.data)) {
        data = res.data.data.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res)) {
        data = res;
      } else if (res?.rows && Array.isArray(res.rows)) {
        data = res.rows;
      }
      
      setCharges(data);
      const totalCount = res?.data?.total || res?.data?.count || res?.total || data.length;
      if (res?.data?.totalPages) setTotalPages(res.data.totalPages);
      if (totalCount) setTotalRecords(totalCount);
    } catch (error) {
      console.error('Failed to fetch charges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, [refreshTrigger]);

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

  if (viewMode === 'card' && isLoading) {
    return <MasterLoader type="card" />;
  }

  const columns = [
    {
      header: 'Code',
      key: 'charge_code',
      render: (row) => <span className="font-medium uppercase">{row.charge_code}</span>
    },
    {
      header: 'Charge Name',
      key: 'charge_name',
      render: (row) => row.charge_name
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', padding: '16px' }}>
        {paginatedList.map(c => (
          <div key={c.id}>
            <MasterDataCard
              title={c.charge_name}
              code={c.charge_code}
              status={c.status}
              onEdit={() => onEdit && onEdit(c)}
              onDelete={() => handleDeleteClick(c)}
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
