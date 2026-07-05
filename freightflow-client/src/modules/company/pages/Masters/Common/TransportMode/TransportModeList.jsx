import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { commonService } from '../../../../../masters/services/common.service';

const TransportModeList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [modes, setModes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchModes();
  }, [refreshTrigger]);

  const fetchModes = async () => {
    setIsLoading(true);
    try {
      const data = await commonService.getTransportModes();
      let modeData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        modeData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        modeData = data.data;
      } else if (Array.isArray(data)) {
        modeData = data;
      }
      setModes(modeData);
    } catch (error) {
      console.error('Failed to fetch transport modes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModes = modes.filter(mode => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (mode.mode_name && mode.mode_name.toLowerCase().includes(query)) ||
      (mode.mode_code && mode.mode_code.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Mode Code',
      key: 'mode_code',
      render: (row) => <span className="font-medium">{row.mode_code}</span>
    },
    {
      header: 'Mode Name',
      key: 'mode_name',
      render: (row) => row.mode_name
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
            title="Edit Transport Mode"
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
        {filteredModes.map(mode => (
          <div key={mode.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(mode)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{mode.mode_name}</h4>
              <Badge variant={mode.status === 'Active' ? 'success' : 'danger'}>{mode.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {mode.mode_code}</p>
            <p className="text-secondary-light text-sm">{mode.description || '-'}</p>
          </div>
        ))}
        {filteredModes.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No transport modes found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredModes}
        isLoading={isLoading}
        emptyStateMsg="No transport modes found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default TransportModeList;
