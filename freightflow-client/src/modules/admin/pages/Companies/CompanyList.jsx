import React, { useEffect, useState } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import TableView from '../../../../shared/components/TableView/TableView';
import Button from '../../../../shared/components/Button';
import Badge from '../../../../shared/components/Badge';
import { adminService } from '../../services/admin.service';

const CompanyList = ({ onEdit, searchQuery = '', viewMode = 'table', refreshTrigger = 0 }) => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModalData, setViewModalData] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, [refreshTrigger]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getCompanies();
      const companyData = data?.data || data || [];
      setCompanies(companyData);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (company.company_name && company.company_name.toLowerCase().includes(query)) ||
      (company.company_code && company.company_code.toLowerCase().includes(query)) ||
      (company.company_email && company.company_email.toLowerCase().includes(query)) ||
      (company.city && company.city.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      header: 'Company Name',
      key: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.company_name || row.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>Code: {row.company_code || row.code}</div>
        </div>
      )
    },
    {
      header: 'Email / Contact',
      key: 'contact',
      render: (row) => (
        <div>
          <div>{row.company_email || '-'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>{row.contact_number || '-'}</div>
        </div>
      )
    },
    {
      header: 'City',
      key: 'city',
      render: (row) => row.city || '-'
    },
    {
      header: 'PAN / GST',
      key: 'tax',
      render: (row) => (
        <div>
          <div>PAN: {row.pan_card_number || '-'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>GST: {row.gst_number || '-'}</div>
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
        <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
          <button 
            className="action-btn view-btn"
            onClick={() => setViewModalData(row)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            className="action-btn edit-btn"
            onClick={() => onEdit && onEdit(row)}
            title="Edit Company"
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
      <div className="company-grid-view">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredCompanies.map(company => (
            <div key={company.id || company.company_code} className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit && onEdit(company)}>
              <div className="flex justify-between align-center mb-md">
                <h4 className="m-0 text-primary">{company.company_name}</h4>
                <Badge variant={company.status === 'Active' ? 'success' : 'danger'}>{company.status || 'Active'}</Badge>
              </div>
              <p className="text-secondary-light text-sm mb-xs">Code: {company.company_code}</p>
              <p className="text-secondary-light text-sm mb-xs">Email: {company.company_email || '-'}</p>
              <p className="text-secondary-light text-sm">City: {company.city || '-'}</p>
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
              No companies found. Create one to get started.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="company-list-container bg-surface border-light rounded-lg shadow-sm">
      <TableView
        columns={columns}
        data={filteredCompanies}
        isLoading={isLoading}
        emptyStateMsg="No companies found. Create one to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />

      {viewModalData && (
        <div className="modal-overlay" onClick={() => setViewModalData(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="m-0">Company Details</h3>
              <button className="close-btn" onClick={() => setViewModalData(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item"><strong>Company Name:</strong> {viewModalData.company_name}</div>
                <div className="detail-item"><strong>Company Code:</strong> {viewModalData.company_code}</div>
                <div className="detail-item"><strong>Email:</strong> {viewModalData.company_email || '-'}</div>
                <div className="detail-item"><strong>Contact Number:</strong> {viewModalData.contact_number || '-'}</div>
                <div className="detail-item"><strong>Address:</strong> {viewModalData.address || '-'}</div>
                <div className="detail-item"><strong>City:</strong> {viewModalData.city || '-'}</div>
                
                <div className="detail-item"><strong>PAN Card:</strong> {viewModalData.pan_card_number || '-'}</div>
                <div className="detail-item"><strong>GST Number:</strong> {viewModalData.gst_number || '-'}</div>
                <div className="detail-item"><strong>CHA Licence:</strong> {viewModalData.cha_licence_number || '-'}</div>
                
                <div className="detail-item"><strong>Bank Name:</strong> {viewModalData.bank_name || '-'}</div>
                <div className="detail-item"><strong>Account Number:</strong> {viewModalData.account_number || '-'}</div>
                <div className="detail-item"><strong>IFSC Code:</strong> {viewModalData.ifsc_code || '-'}</div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="primary" onClick={() => setViewModalData(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background-color: #ffffff;
          width: 600px;
          max-width: 90vw;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          z-index: 1001;
        }
        .modal-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--color-text-tertiary);
        }
        .modal-body {
          padding: 1.5rem;
          max-height: 60vh;
          overflow-y: auto;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .detail-item {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
        .detail-item strong {
          color: var(--color-text-primary);
          display: block;
          margin-bottom: 0.25rem;
        }
        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: flex-end;
        }
        .table-view-wrapper .clickable-row {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default CompanyList;
