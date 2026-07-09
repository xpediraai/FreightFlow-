import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../../shared/components/Master/MasterDataCard';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { businessService } from '../../../../../masters/services/business.service';

const CustomerList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0, onTotalCountChange, statusFilter = 'ALL STATUS' }) => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [refreshTrigger]);
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await businessService.getCustomers({ page: 1, limit: 10000 });
      let customerData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        customerData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        customerData = data.data;
      } else if (Array.isArray(data)) {
        customerData = data;
      }
      setCustomers(customerData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };




  const filteredList = customers.filter(item => {
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
      key: 'customer_code',
      render: (row) => <span className="font-medium uppercase">{row.customer_code}</span>
    },
    {
      header: 'Customer Name',
      key: 'customer_name',
      render: (row) => row.customer_name
    },
    {
      header: 'Type',
      key: 'customer_type',
      render: (row) => row.customer_type || '-'
    },
    {
      header: 'Category',
      key: 'customer_category',
      render: (row) => row.customer_category || '-'
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
            title="Edit Customer"
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
        {paginatedList.map(c => (
          <div key={c.id}>
            <MasterDataCard
              title={c.customer_name}
              code={c.customer_code}
              status={c.status}
              locationText={`${c.city?.city_name || 'Global'} → ${c.country?.country_name || 'Worldwide'}`}
              locationIcon={MapPin}
              onEdit={() => onEdit && onEdit(c)}
              gridData={[
                { label: 'Customer Type', value: c.customer_type },
                { label: 'Category', value: c.customer_category },
                { label: 'Currency', value: c.currency?.currency_code },
                { label: 'Payment Terms', value: c.payment_terms }
              ]}
            />
          </div>
        ))}
        {paginatedList.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No customers found.
          </div>
        )}
      </div>
    );
  }

  return (
    <TableView
      columns={columns}
      data={paginatedList}
      isLoading={isLoading}
      emptyStateMsg="No customers found. Create one to get started."
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
  );
};

export default CustomerList;
