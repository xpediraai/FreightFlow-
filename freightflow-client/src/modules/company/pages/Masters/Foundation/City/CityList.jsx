import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const CityList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, [refreshTrigger]);

  const fetchCities = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getCities();
      let cityData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        cityData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        cityData = data.data;
      } else if (Array.isArray(data)) {
        cityData = data;
      }
      setCities(cityData);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCities = cities.filter(city => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (city.city_name && city.city_name.toLowerCase().includes(query)) ||
      (city.city_code && city.city_code.toLowerCase().includes(query)) ||
      (city.State?.state_name && city.State.state_name.toLowerCase().includes(query)) ||
      (city.Country?.country_name && city.Country.country_name.toLowerCase().includes(query)) ||
      (city.pincode && city.pincode.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'City Code',
      key: 'city_code',
      render: (row) => <span className="font-medium">{row.city_code}</span>
    },
    {
      header: 'City Name',
      key: 'city_name',
      render: (row) => row.city_name
    },
    {
      header: 'State / Country',
      key: 'state_country',
      render: (row) => (
        <div>
          <div>{row.State?.state_name || '-'}</div>
          <div className="text-secondary-light text-xs">{row.Country?.country_name || '-'}</div>
        </div>
      )
    },
    {
      header: 'GST / Pincode',
      key: 'gst_pincode',
      render: (row) => (
        <div>
          <div>{row.gst || '-'}</div>
          <div className="text-secondary-light text-xs">{row.pincode || '-'}</div>
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
            title="Edit City"
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
        {filteredCities.map(city => (
          <div key={city.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(city)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{city.city_name}</h4>
              <Badge variant={city.status === 'Active' ? 'success' : 'danger'}>{city.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {city.city_code}</p>
            <p className="text-secondary-light text-sm mb-xs">State: {city.State?.state_name || '-'}</p>
            <p className="text-secondary-light text-sm">Pincode: {city.pincode || '-'}</p>
          </div>
        ))}
        {filteredCities.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No cities found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredCities}
        isLoading={isLoading}
        emptyStateMsg="No cities found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default CityList;
