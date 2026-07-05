import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const ShippingLineList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [lines, setLines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLines();
  }, [refreshTrigger]);

  const fetchLines = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getShippingLines();
      let lineData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        lineData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        lineData = data.data;
      } else if (Array.isArray(data)) {
        lineData = data;
      }
      setLines(lineData);
    } catch (error) {
      console.error('Failed to fetch shipping lines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLines = lines.filter(line => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (line.shipping_line_name && line.shipping_line_name.toLowerCase().includes(query)) ||
      (line.shipping_line_code && line.shipping_line_code.toLowerCase().includes(query)) ||
      (line.scac_code && line.scac_code.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Line Code',
      key: 'shipping_line_code',
      render: (row) => <span className="font-medium">{row.shipping_line_code}</span>
    },
    {
      header: 'Line Name',
      key: 'shipping_line_name',
      render: (row) => row.shipping_line_name
    },
    {
      header: 'SCAC Code',
      key: 'scac_code',
      render: (row) => row.scac_code || '-'
    },
    {
      header: 'Contact Person',
      key: 'contact_person',
      render: (row) => row.contact_person || '-'
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
            title="Edit Shipping Line"
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
        {filteredLines.map(line => (
          <div key={line.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(line)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{line.shipping_line_name}</h4>
              <Badge variant={line.status === 'Active' ? 'success' : 'danger'}>{line.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {line.shipping_line_code} {line.scac_code ? `| SCAC: ${line.scac_code}` : ''}</p>
            {line.contact_person && <p className="text-secondary-light text-sm mb-xs">Contact: {line.contact_person}</p>}
            {line.email && <p className="text-secondary-light text-sm">Email: {line.email}</p>}
          </div>
        ))}
        {filteredLines.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No shipping lines found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredLines}
        isLoading={isLoading}
        emptyStateMsg="No shipping lines found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default ShippingLineList;
