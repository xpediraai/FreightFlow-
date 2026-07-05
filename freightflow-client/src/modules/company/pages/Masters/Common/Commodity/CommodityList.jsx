import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { businessService } from '../../../../../masters/services/business.service';

const CommodityList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [commodities, setCommodities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommodities();
  }, [refreshTrigger]);

  const fetchCommodities = async () => {
    setIsLoading(true);
    try {
      const res = await businessService.getCommodities();
      
      let data = [];
      if (res?.data?.data?.data && Array.isArray(res.data.data.data)) {
        data = res.data.data.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      }
      
      setCommodities(data);
    } catch (error) {
      console.error('Failed to fetch commodities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCommodities = commodities.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.commodity_name && item.commodity_name.toLowerCase().includes(query)) ||
      (item.commodity_code && item.commodity_code.toLowerCase().includes(query)) ||
      (item.hs_code && item.hs_code.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Code',
      key: 'commodity_code',
      render: (row) => <span className="font-medium uppercase">{row.commodity_code}</span>
    },
    {
      header: 'Commodity Name',
      key: 'commodity_name',
      render: (row) => row.commodity_name
    },
    {
      header: 'HS Code',
      key: 'hs_code',
      render: (row) => row.hs_code || '-'
    },
    {
      header: 'Hazardous',
      key: 'hazardous',
      render: (row) => (
        <Badge variant={row.hazardous === 'Yes' ? 'danger' : 'neutral'}>
          {row.hazardous || 'No'}
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
            title="Edit"
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
        {filteredCommodities.map(c => (
          <div key={c.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(c)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{c.commodity_name}</h4>
              <Badge variant={c.status === 'Active' ? 'success' : 'danger'}>{c.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: <span className="uppercase">{c.commodity_code}</span></p>
            {c.hs_code && <p className="text-secondary-light text-sm mb-xs">HS Code: {c.hs_code}</p>}
            <p className="text-secondary-light text-sm">Hazardous: {c.hazardous}</p>
          </div>
        ))}
        {filteredCommodities.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No commodities found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredCommodities}
        isLoading={isLoading}
        emptyStateMsg="No commodities found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default CommodityList;
