import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { businessService } from '../../../../../masters/services/business.service';

const CommodityList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [commodities, setCommodities] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommodities();
  }, [refreshTrigger, page, limit, searchQuery]);

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
        {commodities.map(c => (
          <div key={c.id}>
            <MasterDataCard
              title={c.commodity_name}
              code={c.commodity_code}
              status={c.status}
              onEdit={() => onEdit && onEdit(c)}
              gridData={[
                { label: 'HS Code', value: c.hs_code },
                { label: 'Hazardous', value: c.hazardous }
              ]}
            />
          </div>
        ))}
        {commodities.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No records found.
          </div>
        )}
      </div>
    );
  }

  return (
    <TableView
        columns={columns}
        data={commodities}
        isLoading={isLoading}
        emptyStateMsg="No commodities found. Create one to get started."
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

export default CommodityList;
