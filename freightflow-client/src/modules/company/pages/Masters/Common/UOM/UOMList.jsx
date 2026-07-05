import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { commonService } from '../../../../../masters/services/common.service';

const UOMList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [uoms, setUOMs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUOMs();
  }, [refreshTrigger]);

  const fetchUOMs = async () => {
    setIsLoading(true);
    try {
      const data = await commonService.getUOMs();
      let uomData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        uomData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        uomData = data.data;
      } else if (Array.isArray(data)) {
        uomData = data;
      }
      setUOMs(uomData);
    } catch (error) {
      console.error('Failed to fetch UOMs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUOMs = uoms.filter(uom => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (uom.uom_name && uom.uom_name.toLowerCase().includes(query)) ||
      (uom.uom_code && uom.uom_code.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'UOM Code',
      key: 'uom_code',
      render: (row) => <span className="font-medium">{row.uom_code}</span>
    },
    {
      header: 'UOM Name',
      key: 'uom_name',
      render: (row) => row.uom_name
    },
    {
      header: 'Symbol',
      key: 'symbol',
      render: (row) => row.symbol || '-'
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
            title="Edit UOM"
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
        {filteredUOMs.map(uom => (
          <div key={uom.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(uom)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{uom.uom_name} ({uom.symbol})</h4>
              <Badge variant={uom.status === 'Active' ? 'success' : 'danger'}>{uom.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {uom.uom_code}</p>
            <p className="text-secondary-light text-sm">{uom.description || '-'}</p>
          </div>
        ))}
        {filteredUOMs.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No UOMs found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredUOMs}
        isLoading={isLoading}
        emptyStateMsg="No UOMs found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default UOMList;
