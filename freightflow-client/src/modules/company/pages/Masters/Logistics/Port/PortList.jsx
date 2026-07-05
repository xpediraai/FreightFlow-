import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const PortList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [ports, setPorts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPorts();
  }, [refreshTrigger]);

  const fetchPorts = async () => {
    setIsLoading(true);
    try {
      const data = await logisticsService.getPorts();
      let portData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        portData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        portData = data.data;
      } else if (Array.isArray(data)) {
        portData = data;
      }
      setPorts(portData);
    } catch (error) {
      console.error('Failed to fetch ports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPorts = ports.filter(port => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (port.port_name && port.port_name.toLowerCase().includes(query)) ||
      (port.port_code && port.port_code.toLowerCase().includes(query)) ||
      (port.time_zone && port.time_zone.toLowerCase().includes(query))
    );
  });

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
        {filteredPorts.map(port => (
          <div key={port.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(port)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{port.port_name}</h4>
              <Badge variant={port.status === 'Active' ? 'success' : 'danger'}>{port.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {port.port_code}</p>
            <p className="text-secondary-light text-sm">Time Zone: {port.time_zone || '-'}</p>
          </div>
        ))}
        {filteredPorts.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No ports found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredPorts}
        isLoading={isLoading}
        emptyStateMsg="No ports found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default PortList;
