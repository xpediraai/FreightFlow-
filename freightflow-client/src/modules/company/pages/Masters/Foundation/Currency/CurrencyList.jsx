import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../../shared/components/Master/MasterDataCard';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const CurrencyList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 , onTotalCountChange, statusFilter = 'ALL STATUS'}) => {
  const [currencies, setCurrencies] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
  }, [refreshTrigger]);
  const fetchCurrencies = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getCurrencies({ page: 1, limit: 10000 });
      let currencyData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        currencyData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        currencyData = data.data;
      } else if (Array.isArray(data)) {
        currencyData = data;
      }
      setCurrencies(currencyData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  
  const filteredList = currencies.filter(item => {
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
        {paginatedList.map(currency => (
          <div key={currency.id}>
            <MasterDataCard
              title={`${currency.currency_name} (${currency.symbol})`}
              code={currency.currency_code}
              status={currency.status}
              onEdit={() => onEdit && onEdit(currency)}
              gridData={[
                { label: 'Exchange Rate', value: currency.exchange_rate },
                { label: 'Base Currency', value: currency.base_currency }
              ]}
            />
          </div>
        ))}
        {paginatedList.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No currencies found.
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
        emptyStateMsg="No currencies found. Create one to get started."
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

export default CurrencyList;
