import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const CurrencyList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
  }, [refreshTrigger]);

  const fetchCurrencies = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getCurrencies();
      let currencyData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        currencyData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        currencyData = data.data;
      } else if (Array.isArray(data)) {
        currencyData = data;
      }
      setCurrencies(currencyData);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCurrencies = currencies.filter(currency => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (currency.currency_name && currency.currency_name.toLowerCase().includes(query)) ||
      (currency.currency_code && currency.currency_code.toLowerCase().includes(query)) ||
      (currency.symbol && currency.symbol.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Currency Code',
      key: 'currency_code',
      render: (row) => <span className="font-medium">{row.currency_code}</span>
    },
    {
      header: 'Currency Name',
      key: 'currency_name',
      render: (row) => row.currency_name
    },
    {
      header: 'Symbol',
      key: 'symbol',
      render: (row) => row.symbol || '-'
    },
    {
      header: 'Exchange Rate',
      key: 'exchange_rate',
      render: (row) => row.exchange_rate
    },
    {
      header: 'Base Currency',
      key: 'base_currency',
      render: (row) => (
        <Badge variant={row.base_currency === 'Yes' ? 'primary' : 'default'}>
          {row.base_currency}
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
            title="Edit Currency"
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
        {filteredCurrencies.map(currency => (
          <div key={currency.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(currency)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{currency.currency_name} ({currency.symbol})</h4>
              <Badge variant={currency.status === 'Active' ? 'success' : 'danger'}>{currency.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {currency.currency_code}</p>
            <p className="text-secondary-light text-sm mb-xs">Rate: {currency.exchange_rate}</p>
            <p className="text-secondary-light text-sm">Base: {currency.base_currency}</p>
          </div>
        ))}
        {filteredCurrencies.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No currencies found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredCurrencies}
        isLoading={isLoading}
        emptyStateMsg="No currencies found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default CurrencyList;
