import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const PortList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [ports, setPorts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPorts();
  }, [refreshTrigger, page, limit, searchQuery]);

  const fetchPorts = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getPorts({ page, limit, search: searchQuery });
      let portData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        portData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        portData = data.data;
      } else if (Array.isArray(data)) {
        portData = data;
      }
      setPorts(portData);
      if (data?.data?.totalPages) setTotalPages(data.data.totalPages);
      if (data?.data?.total) setTotalRecords(data.data.total);
    } catch (error) {
      console.error('Failed to fetch ports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  const columns = [
    {
      header: 'Port Code',
      key: 'port_code',
      render: (row) => <span className="font-medium">{row.port_code}</span>
    },
    {
      header: 'Port Name',
      key: 'port_name',
      render: (row) => row.port_name
    },
    {
      header: 'Time Zone',
      key: 'time_zone',
      render: (row) => row.time_zone || '-'
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
            title="Edit Port"
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
        {ports.map(port => (
          <div key={port.id}>
            <MasterDataCard
              title={port.port_name}
              code={port.port_code}
              status={port.status}
              onEdit={() => onEdit && onEdit(port)}
              gridData={[
                { label: 'Time Zone', value: port.time_zone || '-' }
              ]}
            />
          </div>
        ))}
        {ports.length === 0 && !isLoading && (
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
        data={ports}
        isLoading={isLoading}
        emptyStateMsg="No ports found. Create one to get started."
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

export default PortList;
