import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const PaymentTermList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPaymentTerms();
  }, [refreshTrigger]);

  const fetchPaymentTerms = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getPaymentTerms();
      let termData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        termData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        termData = data.data;
      } else if (Array.isArray(data)) {
        termData = data;
      }
      setPaymentTerms(termData);
    } catch (error) {
      console.error('Failed to fetch payment terms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTerms = paymentTerms.filter(term => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (term.payment_term_name && term.payment_term_name.toLowerCase().includes(query)) ||
      (term.payment_term_code && term.payment_term_code.toLowerCase().includes(query))
    );
  });

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
        {filteredTerms.map(term => (
          <div key={term.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(term)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{term.payment_term_name}</h4>
              <Badge variant={term.status === 'Active' ? 'success' : 'danger'}>{term.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {term.payment_term_code}</p>
            <p className="text-secondary-light text-sm mb-xs">Credit Days: {term.credit_days}</p>
            <p className="text-secondary-light text-sm">{term.description || '-'}</p>
          </div>
        ))}
        {filteredTerms.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No payment terms found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredTerms}
        isLoading={isLoading}
        emptyStateMsg="No payment terms found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default PaymentTermList;
