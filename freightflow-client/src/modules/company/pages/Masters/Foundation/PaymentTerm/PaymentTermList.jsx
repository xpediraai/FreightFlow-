import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../../shared/components/Master/MasterDataCard';
import MasterLoader from '../../../../../../shared/components/Master/MasterLoader';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const PaymentTermList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [paymentTerms, setPaymentTerms] = useState([]);
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
      await foundationService.deletePaymentTerm(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setPaymentTerms(prev => prev.filter(item => item.id !== itemToDelete.id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };


  const fetchPaymentTerms = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getPaymentTerms({ page: 1, limit: 10000 });
      let termData = [];
      if (data?.data?.rows && Array.isArray(data.data.rows)) {
        termData = data.data.rows;
      } else if (data?.data?.data && Array.isArray(data.data.data)) {
        termData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        termData = data.data;
      } else if (Array.isArray(data)) {
        termData = data;
      } else if (data?.rows && Array.isArray(data.rows)) {
        termData = data.rows;
      }
      setPaymentTerms(termData);
      const totalCount = data?.data?.total || data?.data?.count || data?.total || termData.length;
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (totalCount) setTotalRecords(totalCount);
    } catch (error) {
      console.error('Failed to fetch payment terms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentTerms();
  }, [refreshTrigger]);

  const filteredList = paymentTerms.filter(item => {
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
      header: 'Payment Term Code',
      key: 'payment_term_code',
      render: (row) => <span className="font-medium">{row.payment_term_code}</span>
    },
    {
      header: 'Payment Term Name',
      key: 'payment_term_name',
      render: (row) => row.payment_term_name
    },
    {
      header: 'Credit Days',
      key: 'credit_days',
      render: (row) => row.credit_days
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
            title="Edit Payment Term"
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
        {paginatedList.map(term => (
          <div key={term.id}>
            <MasterDataCard
              title={term.payment_term_name}
              code={term.payment_term_code}
              status={term.status}
              onEdit={() => onEdit && onEdit(term)}
              onDelete={() => handleDeleteClick(term)}
              gridData={[
                { label: 'Credit Days', value: term.credit_days },
                { label: 'Description', value: term.description }
              ]}
            />
          </div>
        ))}
        {paginatedList.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No payment terms found.
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? itemToDelete.term_name || itemToDelete.name || itemToDelete.code : ''}
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
        emptyStateMsg="No payment terms found. Create one to get started."
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
        itemName={itemToDelete ? itemToDelete.term_name || itemToDelete.name || itemToDelete.code : ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default PaymentTermList;
