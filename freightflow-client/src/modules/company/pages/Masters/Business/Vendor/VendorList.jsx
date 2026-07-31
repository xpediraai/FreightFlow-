import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from '../../../../../../shared/components/ConfirmDeleteModal';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../../shared/components/Master/MasterDataCard';
import MasterLoader from '../../../../../../shared/components/Master/MasterLoader';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { businessService } from '../../../../../masters/services/business.service';

const VendorList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [vendors, setVendors] = useState([]);
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
      await businessService.deleteVendor(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setVendors(prev => prev.filter(item => item.id !== itemToDelete.id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await businessService.getVendors({ page: 1, limit: 10000 });
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
      
      setVendors(data);
      const totalCount = res?.data?.total || res?.data?.count || res?.total || data.length;
      if (res?.data?.totalPages) setTotalPages(res.data.totalPages);
      if (totalCount) setTotalRecords(totalCount);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [refreshTrigger]);

  const filteredList = vendors.filter(item => {
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
      key: 'vendor_code',
      render: (row) => <span className="font-medium text-primary uppercase">{row.vendor_code}</span>
    },
    {
      header: 'Vendor Details',
      key: 'vendor_name',
      render: (row) => (
        <div>
          <div className="font-medium text-text">{row.vendor_name}</div>
          <div className="text-xs text-tertiary">{row.email || 'No email'} | {row.mobile || 'No mobile'}</div>
        </div>
      )
    },
    {
      header: 'Type',
      key: 'vendor_type',
      render: (row) => row.vendor_type || '-'
    },
    {
      header: 'Tax Info',
      key: 'tax_info',
      render: (row) => (
        <div className="text-sm">
          {row.gst_number ? <div>GST: {row.gst_number}</div> : null}
          {row.pan_number ? <div>PAN: {row.pan_number}</div> : null}
          {!row.gst_number && !row.pan_number ? '-' : null}
        </div>
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
        {paginatedList.map(v => (
          <div key={v.id}>
            <MasterDataCard
              title={v.vendor_name}
              code={v.vendor_code}
              status={v.status}
              locationText={`${v.city?.city_name || 'Global'} → ${v.country?.country_name || 'Worldwide'}`}
              locationIcon={MapPin}
              onEdit={() => onEdit && onEdit(v)}
              onDelete={() => handleDeleteClick(v)}
              gridData={[
                { label: 'Vendor Type', value: v.vendor_type },
                { label: 'Mobile', value: v.mobile },
                { label: 'Currency', value: v.currency?.currency_code },
                { label: 'Payment Terms', value: v.payment_terms }
              ]}
            />
          </div>
        ))}
        {paginatedList.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No vendors found.
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? itemToDelete.vendor_name || itemToDelete.name || itemToDelete.code : ''}
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
        emptyStateMsg="No vendors found. Create one to get started."
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
        itemName={itemToDelete ? itemToDelete.vendor_name || itemToDelete.name || itemToDelete.code : ''}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default VendorList;
