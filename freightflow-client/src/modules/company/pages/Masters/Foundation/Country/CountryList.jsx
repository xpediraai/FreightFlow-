import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const CountryList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, [refreshTrigger]);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getCountries();
      let countryData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        countryData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        countryData = data.data;
      } else if (Array.isArray(data)) {
        countryData = data;
      }
      setCountries(countryData);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCountries = countries.filter(country => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (country.country_name && country.country_name.toLowerCase().includes(query)) ||
      (country.country_code && country.country_code.toLowerCase().includes(query)) ||
      (country.phone_code && country.phone_code.toLowerCase().includes(query))
    );
  });

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
        {filteredCountries.map(country => (
          <div key={country.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(country)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{country.country_name}</h4>
              <Badge variant={country.status === 'Active' ? 'success' : 'danger'}>{country.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {country.country_code}</p>
            <p className="text-secondary-light text-sm">Phone Code: {country.phone_code || '-'}</p>
          </div>
        ))}
        {filteredCountries.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No countries found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredCountries}
        isLoading={isLoading}
        emptyStateMsg="No countries found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default CountryList;
