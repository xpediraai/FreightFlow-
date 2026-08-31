import React, { useState } from 'react';
import { Eye, Edit2, Trash2, MapPin, Ship, Package, DollarSign, Calendar, FileText, ShoppingBag } from 'lucide-react';
import TableView from '../../../../../shared/components/TableView/TableView';
import Badge from '../../../../../shared/components/Badge/Badge';
import ConfirmDeleteModal from '../../../../../shared/components/ConfirmDeleteModal/ConfirmDeleteModal';
import QuotationPreviewModal from './QuotationPreviewModal';

const QuotationList = ({
  quotations = [],
  onEdit,
  onDelete,
  searchQuery = '',
  viewMode = 'table',
  statusFilter = 'ALL STATUS'
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewQuotation, setPreviewQuotation] = useState(null);

  const filteredQuotations = quotations.filter(q => {
    const matchesStatus = 
      statusFilter === 'ALL STATUS' ||
      statusFilter === 'ALL' ||
      (q.status && q.status.toUpperCase() === statusFilter.toUpperCase());

    if (!matchesStatus) return false;
    if (!searchQuery) return true;

    const term = searchQuery.toLowerCase();
    const qNo = (q.quotation_no || '').toLowerCase();
    const inqNo = (q.inquiry_no || '').toLowerCase();
    const expName = (q.exporter_name || q.customer_name || '').toLowerCase();
    const pol = (q.pol || q.origin || '').toLowerCase();
    const pod = (q.pod || q.destination || '').toLowerCase();
    const carrier = (q.selected_carrier || '').toLowerCase();
    const comm = (q.commodity || '').toLowerCase();

    return (
      qNo.includes(term) ||
      inqNo.includes(term) ||
      expName.includes(term) ||
      pol.includes(term) ||
      pod.includes(term) ||
      carrier.includes(term) ||
      comm.includes(term)
    );
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Accepted': return 'success';
      case 'Sent': return 'info';
      case 'Prepared': return 'primary';
      case 'Draft': return 'warning';
      case 'Rejected':
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  };

  const handleDeleteClick = (row, e) => {
    e && e.stopPropagation();
    setDeleteTarget(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      onDelete && onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete quotation:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'QUOTATION NO / EXPORTER',
      key: 'quotation_no',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--primary, #1976D2)' }}>{row.quotation_no}</div>
          <div style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 500 }}>
            {row.exporter_name || row.customer_name || 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'LINKED INQUIRY / ROUTE',
      key: 'route',
      render: (row) => (
        <div>
          <div style={{ fontSize: '0.78rem', color: '#0288d1', fontWeight: 600 }}>
            Inquiry: {row.inquiry_no || 'Manual / Direct'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', marginTop: '2px' }}>
            <MapPin size={13} style={{ color: '#f57c00', flexShrink: 0 }} />
            <span><strong>{row.pol || row.origin || '-'}</strong> → <strong>{row.pod || row.destination || '-'}</strong></span>
          </div>
        </div>
      )
    },
    {
      header: 'CARRIER & CONTAINERS',
      key: 'carrier',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
            <Ship size={14} color="#0288d1" />
            <span>{row.selected_carrier || row.shipping_line_preference || 'Any Line'}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 500, marginTop: '2px' }}>
            {row.no_of_containers || '1'} x {row.container_type || "20'"} ({row.commodity || 'General'})
          </div>
        </div>
      )
    },
    {
      header: 'TOTAL AMOUNT',
      key: 'total_amount',
      render: (row) => (
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2e7d32' }}>
            ₹{Number(row.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Terms: {row.shipment_terms || 'FOB'}
          </div>
        </div>
      )
    },
    {
      header: 'DATE',
      key: 'quotation_date',
      render: (row) => (
        <div style={{ fontSize: '0.825rem', color: '#4b5563' }}>
          {new Date(row.quotation_date || row.created_at || Date.now()).toLocaleDateString('en-GB')}
        </div>
      )
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status || 'Prepared'}
        </Badge>
      )
    },
    {
      header: 'ACTIONS',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }} onClick={(e) => e.stopPropagation()}>
          <button
            className="action-btn view-btn"
            onClick={() => setPreviewQuotation(row)}
            title="Preview Quotation"
          >
            <Eye size={16} />
          </button>
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit && onEdit(row)}
            title="Edit Quotation"
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="action-btn delete-btn"
            title="Delete"
            onClick={(e) => handleDeleteClick(row, e)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (viewMode === 'card') {
    return (
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredQuotations.map((q) => (
            <div
              key={q.id}
              className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onEdit && onEdit(q)}
              style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontWeight: 800, color: '#1976D2', fontSize: '0.95rem' }}>
                    {q.quotation_no}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Ref Inquiry: {q.inquiry_no || 'N/A'}</div>
                </div>
                <Badge variant={getStatusBadgeVariant(q.status)}>{q.status || 'Prepared'}</Badge>
              </div>

              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#111827', fontWeight: 600 }}>
                {q.exporter_name || q.customer_name}
              </h4>
              
              <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="#f57c00" />
                  <span><strong>{q.pol || q.origin}</strong> → <strong>{q.pod || q.destination}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Ship size={14} color="#0288d1" />
                  <span>Carrier: <strong>{q.selected_carrier || 'Selected Line'}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', alignItems: 'center', border: '1px solid #f1f5f9' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#d97706' }}>
                    <Package size={14} color="#d97706" /> {q.no_of_containers || '1'} x {q.container_type || "20'"}
                  </span>
                  <span style={{ fontWeight: 800, color: '#2e7d32', fontSize: '0.95rem' }}>
                    ₹{Number(q.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Terms: {q.shipment_terms || 'FOB'} | {new Date(q.quotation_date || Date.now()).toLocaleDateString('en-GB')}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="action-btn view-btn" onClick={() => setPreviewQuotation(q)} title="Preview"><Eye size={16} /></button>
                  <button className="action-btn edit-btn" onClick={() => onEdit && onEdit(q)} title="Edit"><Edit2 size={16} /></button>
                  <button className="action-btn delete-btn" onClick={(e) => handleDeleteClick(q, e)} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
          {filteredQuotations.length === 0 && (
            <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              No export quotations found. Click "+ Create Quotation" to generate one.
            </div>
          )}
        </div>

        {deleteTarget && (
          <ConfirmDeleteModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleConfirmDelete}
            entityName={deleteTarget.quotation_no}
            isDeleting={isDeleting}
          />
        )}

        {previewQuotation && (
          <QuotationPreviewModal
            quotation={previewQuotation}
            onClose={() => setPreviewQuotation(null)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <TableView
        columns={columns}
        data={filteredQuotations}
        isLoading={false}
        emptyStateMsg="No export quotations found. Click '+ Create Quotation' to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          entityName={deleteTarget.quotation_no}
          isDeleting={isDeleting}
        />
      )}

      {previewQuotation && (
        <QuotationPreviewModal
          quotation={previewQuotation}
          onClose={() => setPreviewQuotation(null)}
        />
      )}
    </>
  );
};

export default QuotationList;
