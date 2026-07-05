import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { commonService } from '../../../../../masters/services/common.service';

const IncotermList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [incoterms, setIncoterms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIncoterms();
  }, [refreshTrigger]);

  const fetchIncoterms = async () => {
    setIsLoading(true);
    try {
      const data = await commonService.getIncoterms();
      let termData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        termData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        termData = data.data;
      } else if (Array.isArray(data)) {
        termData = data;
      }
      setIncoterms(termData);
    } catch (error) {
      console.error('Failed to fetch incoterms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTerms = incoterms.filter(term => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (term.incoterm_name && term.incoterm_name.toLowerCase().includes(query)) ||
      (term.incoterm_code && term.incoterm_code.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Incoterm Code',
      key: 'incoterm_code',
      render: (row) => <span className="font-medium">{row.incoterm_code}</span>
    },
    {
      header: 'Incoterm Name',
      key: 'incoterm_name',
      render: (row) => row.incoterm_name
    },
    {
      header: 'Transport Mode',
      key: 'transport_mode',
      render: (row) => row.transport_mode || 'Any'
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
            title="Edit Incoterm"
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
        {filteredTerms.map(term => (
          <div key={term.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(term)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{term.incoterm_name}</h4>
              <Badge variant={term.status === 'Active' ? 'success' : 'danger'}>{term.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: {term.incoterm_code}</p>
            <p className="text-secondary-light text-sm mb-xs">Mode: {term.transport_mode || 'Any'}</p>
            <p className="text-secondary-light text-sm">{term.description || '-'}</p>
          </div>
        ))}
        {filteredTerms.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No incoterms found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredTerms}
        isLoading={isLoading}
        emptyStateMsg="No incoterms found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default IncotermList;
