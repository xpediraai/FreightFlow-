import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import MasterDataCard from '../../../../../../shared/components/Master/MasterDataCard';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const CountryList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [countries, setCountries] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, [refreshTrigger, page, limit, searchQuery]);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getCountries({ page, limit, search: searchQuery });
      let countryData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        countryData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        countryData = data.data;
      } else if (Array.isArray(data)) {
        countryData = data;
      }
      setCountries(countryData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  const columns = [
    {
      header: 'Country Code',
      key: 'country_code',
      render: (row) => <span className="font-medium">{row.country_code}</span>
    },
    {
      header: 'Country Name',
      key: 'country_name',
      render: (row) => row.country_name
    },
    {
      header: 'Phone Code',
      key: 'phone_code',
      render: (row) => row.phone_code || '-'
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
            title="Edit Country"
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
        {countries.map(country => (
          <div key={country.id}>
            <MasterDataCard
              title={country.country_name}
              code={country.country_code}
              status={country.status}
              onEdit={() => onEdit && onEdit(country)}
              gridData={[
                { label: 'Phone Code', value: country.phone_code }
              ]}
            />
          </div>
        ))}
        {countries.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No countries found.
          </div>
        )}
      </div>
    );
  }

  return (
    <TableView
        columns={columns}
        data={countries}
        isLoading={isLoading}
        emptyStateMsg="No countries found. Create one to get started."
        paginationProps={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
          totalItems: totalRecords,
          itemsPerPage: limit,
          onLimitChange: (newLimit) => { setLimit(newLimit); setPage(1); }
        }}
        onRowClick={(row) => onEdit && onEdit(row)}
      />
);
};

export default CountryList;
