import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { organizationService } from '../../../../../masters/services/organization.service';

const DesignationList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [designations, setDesignations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDesignations();
  }, [refreshTrigger]);

  const fetchDesignations = async () => {
    setIsLoading(true);
    try {
      const data = await organizationService.getDesignations();
      let desigData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        desigData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        desigData = data.data;
      } else if (Array.isArray(data)) {
        desigData = data;
      }
      setDesignations(desigData);
    } catch (error) {
      console.error('Failed to fetch designations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDesignations = designations.filter(desig => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (desig.designation_name && desig.designation_name.toLowerCase().includes(query)) ||
      (desig.designation_code && desig.designation_code.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Code',
      key: 'designation_code',
      render: (row) => <span className="font-medium uppercase">{row.designation_code}</span>
    },
    {
      header: 'Designation Name',
      key: 'designation_name',
      render: (row) => row.designation_name
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
            title="Edit Designation"
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
        {filteredDesignations.map(desig => (
          <div key={desig.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(desig)}>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="m-0 text-primary font-bold">{desig.designation_name}</h4>
              <Badge variant={desig.status === 'Active' ? 'success' : 'danger'}>{desig.status || 'Active'}</Badge>
            </div>
            <p className="text-secondary-light text-sm mb-xs">Code: <span className="uppercase">{desig.designation_code}</span></p>
            {desig.description && <p className="text-secondary-light text-sm">{desig.description}</p>}
          </div>
        ))}
        {filteredDesignations.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No designations found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredDesignations}
        isLoading={isLoading}
        emptyStateMsg="No designations found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default DesignationList;
