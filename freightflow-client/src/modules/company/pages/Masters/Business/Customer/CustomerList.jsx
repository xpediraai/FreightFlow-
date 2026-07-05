import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { businessService } from '../../../../../masters/services/business.service';

const CustomerList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [refreshTrigger]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await businessService.getCustomers();
      let customerData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        customerData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        customerData = data.data;
      } else if (Array.isArray(data)) {
        customerData = data;
      }
      setCustomers(customerData);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (c.customer_name && c.customer_name.toLowerCase().includes(query)) ||
      (c.customer_code && c.customer_code.toLowerCase().includes(query)) ||
      (c.customer_category && c.customer_category.toLowerCase().includes(query))
    );
  });

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
        {filteredCustomers.map(c => (
          <div key={c.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(c)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{c.customer_name}</h4>
              <Badge variant={c.status === 'Active' ? 'success' : 'danger'}>{c.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: <span className="uppercase">{c.customer_code}</span></p>
            {c.customer_type && <p className="text-secondary-light text-sm mb-xs">Type: {c.customer_type}</p>}
            {c.customer_category && <p className="text-secondary-light text-sm">Category: {c.customer_category}</p>}
          </div>
        ))}
        {filteredCustomers.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No customers found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredCustomers}
        isLoading={isLoading}
        emptyStateMsg="No customers found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default CustomerList;
