import React, { useState, useEffect } from 'react';
import TableView from '../../../../../../shared/components/TableView';
import Badge from '../../../../../../shared/components/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { businessService } from '../../../../../masters/services/business.service';

const VendorList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, [refreshTrigger]);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await businessService.getVendors();
      
      let data = [];
      if (res?.data?.data?.data && Array.isArray(res.data.data.data)) {
        data = res.data.data.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      }
      
      setVendors(data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVendors = vendors.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.vendor_name && item.vendor_name.toLowerCase().includes(query)) ||
      (item.vendor_code && item.vendor_code.toLowerCase().includes(query)) ||
      (item.vendor_type && item.vendor_type.toLowerCase().includes(query)) ||
      (item.email && item.email.toLowerCase().includes(query)) ||
      (item.mobile && item.mobile.toLowerCase().includes(query)) ||
      (item.gst_number && item.gst_number.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Code',
      key: 'vendor_code',
      render: (row) => <span className="font-medium text-primary uppercase">{row.vendor_code}</span>
    },
    {
      header: 'Vendor Details',
      key: 'vendor_name',
      render: (row) => (
        <div>
          <div className="font-medium text-text">{row.vendor_name}</div>
          <div className="text-xs text-tertiary">{row.email || 'No email'} | {row.mobile || 'No mobile'}</div>
        </div>
      )
    },
    {
      header: 'Type',
      key: 'vendor_type',
      render: (row) => row.vendor_type || '-'
    },
    {
      header: 'Tax Info',
      key: 'tax_info',
      render: (row) => (
        <div className="text-sm">
          {row.gst_number ? <div>GST: {row.gst_number}</div> : null}
          {row.pan_number ? <div>PAN: {row.pan_number}</div> : null}
          {!row.gst_number && !row.pan_number ? '-' : null}
        </div>
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
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredVendors.map(v => (
          <div key={v.id} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(v)}>
            <div className="flex justify-between align-center mb-md pb-sm border-b-light">
              <div>
                <h4 className="m-0 text-primary font-bold text-lg">{v.vendor_name}</h4>
                <p className="text-xs text-secondary-light uppercase tracking-wide mt-1">{v.vendor_code}</p>
              </div>
              <Badge variant={v.status === 'Active' ? 'success' : 'danger'}>{v.status || 'Active'}</Badge>
            </div>
            
            <div className="space-y-sm text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-light">Type:</span>
                <span className="font-medium text-text">{v.vendor_type || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-light">Mobile:</span>
                <span className="text-text">{v.mobile || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-light">Email:</span>
                <span className="text-text truncate ml-md">{v.email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-light">GST:</span>
                <span className="text-text">{v.gst_number || '-'}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredVendors.length === 0 && !isLoading && (
          <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
            No vendors found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredVendors}
        isLoading={isLoading}
        emptyStateMsg="No vendors found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />
    </div>
  );
};

export default VendorList;
