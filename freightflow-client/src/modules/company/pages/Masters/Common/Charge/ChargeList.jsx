import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { businessService } from '../../../../../masters/services/business.service';

const ChargeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [charges, setCharges] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCharges();
  }, [refreshTrigger, page, limit, searchQuery]);

  const fetchCharges = async () => {
    setIsLoading(true);
    try {
      const res = await businessService.getCharges();
      
      let data = [];
      if (res?.data?.data?.data && Array.isArray(res.data.data.data)) {
        data = res.data.data.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      }
      
      setCharges(data);
    } catch (error) {
      console.error('Failed to fetch charges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  const columns = [
    {
      header: 'Code',
      key: 'charge_code',
      render: (row) => <span className="font-medium uppercase">{row.charge_code}</span>
    },
    {
      header: 'Charge Name',
      key: 'charge_name',
      render: (row) => row.charge_name
    },
    {
      header: 'Type',
      key: 'charge_type',
      render: (row) => row.charge_type || '-'
    },
    {
      header: 'Module',
      key: 'applicable_module',
      render: (row) => row.applicable_module || '-'
    },
    {
      header: 'Taxable',
      key: 'tax_applicable',
      render: (row) => (
        <Badge variant={row.tax_applicable ? 'danger' : 'neutral'}>
          {row.tax_applicable ? 'Yes' : 'No'}
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
        {charges.map(c => (
          <div key={c.id}>
            <MasterDataCard
              title={c.charge_name}
              code={c.charge_code}
              status={c.status}
              onEdit={() => onEdit && onEdit(c)}
              gridData={[
                { label: 'Type', value: c.charge_type },
                { label: 'Module', value: c.applicable_module }
              ]}
            />
          </div>
        ))}
        {charges.length === 0 && !isLoading && (
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
        data={charges}
        isLoading={isLoading}
        emptyStateMsg="No charges found. Create one to get started."
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

export default ChargeList;
