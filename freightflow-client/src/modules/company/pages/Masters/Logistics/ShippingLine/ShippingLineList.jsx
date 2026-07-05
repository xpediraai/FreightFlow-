import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const ShippingLineList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [lines, setLines] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLines();
  }, [refreshTrigger, page, limit, searchQuery]);

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
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch shipping lines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

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
        {lines.map(line => (
          <div key={line.id}>
            <MasterDataCard
              title={line.shipping_line_name}
              code={line.shipping_line_code}
              subtitle={line.scac_code ? `SCAC: ${line.scac_code}` : ''}
              status={line.status}
              onEdit={() => onEdit && onEdit(line)}
              gridData={[
                { label: 'Contact', value: line.contact_person },
                { label: 'Email', value: line.email }
              ]}
            />
          </div>
        ))}
        {lines.length === 0 && !isLoading && (
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
        data={lines}
        isLoading={isLoading}
        emptyStateMsg="No shipping lines found. Create one to get started."
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

export default ShippingLineList;
