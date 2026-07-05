import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { businessService } from '../../../../../masters/services/business.service';

const ChargeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [charges, setCharges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCharges();
  }, [refreshTrigger]);

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

  const filteredCharges = charges.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.charge_name && item.charge_name.toLowerCase().includes(query)) ||
      (item.charge_code && item.charge_code.toLowerCase().includes(query)) ||
      (item.charge_type && item.charge_type.toLowerCase().includes(query))
    );
  });

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
        {filteredCharges.map(c => (
          <div key={c.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(c)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{c.charge_name}</h4>
              <Badge variant={c.status === 'Active' ? 'success' : 'danger'}>{c.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: <span className="uppercase">{c.charge_code}</span></p>
            <p className="text-secondary-light text-sm mb-xs">Type: {c.charge_type}</p>
            <p className="text-secondary-light text-sm">Module: {c.applicable_module}</p>
          </div>
        ))}
        {filteredCharges.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No charges found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredCharges}
        isLoading={isLoading}
        emptyStateMsg="No charges found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default ChargeList;
