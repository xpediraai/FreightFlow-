import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { foundationService } from '../../../../../masters/services/foundation.service';

const StateList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStates();
  }, [refreshTrigger]);

  const fetchStates = async () => {
    setIsLoading(true);
    try {
      const data = await foundationService.getStates();
      let stateData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        stateData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        stateData = data.data;
      } else if (Array.isArray(data)) {
        stateData = data;
      }
      setStates(stateData);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStates = states.filter(state => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (state.state_name && state.state_name.toLowerCase().includes(query)) ||
      (state.state_code && state.state_code.toLowerCase().includes(query)) ||
      (state.Country?.country_name && state.Country.country_name.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'State Code',
      key: 'state_code',
      render: (row) => <span className="font-medium">{row.state_code}</span>
    },
    {
      header: 'State Name',
      key: 'state_name',
      render: (row) => row.state_name
    },
    {
      header: 'Country',
      key: 'country',
      render: (row) => row.Country?.country_name || '-'
    },
    {
      header: 'GST State Code',
      key: 'gst_state_code',
      render: (row) => row.gst_state_code || '-'
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
            title="Edit State"
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
        {filteredStates.map(state => (
          <div key={state.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(state)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{state.state_name}</h4>
              <Badge variant={state.status === 'Active' ? 'success' : 'danger'}>{state.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {state.state_code}</p>
            <p className="text-secondary-light text-sm mb-xs">Country: {state.Country?.country_name || '-'}</p>
            <p className="text-secondary-light text-sm">GST Code: {state.gst_state_code || '-'}</p>
          </div>
        ))}
        {filteredStates.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No states found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredStates}
        isLoading={isLoading}
        emptyStateMsg="No states found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default StateList;
