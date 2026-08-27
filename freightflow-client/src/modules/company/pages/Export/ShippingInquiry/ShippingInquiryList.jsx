import React, { useState } from 'react';
import { Eye, Edit2, Trash2, MapPin, Plane, Truck, Ship, Package, ShoppingBag, X } from 'lucide-react';
import TableView from '../../../../../shared/components/TableView/TableView';
import Badge from '../../../../../shared/components/Badge/Badge';
import Button from '../../../../../shared/components/Button';
import ConfirmDeleteModal from '../../../../../shared/components/ConfirmDeleteModal/ConfirmDeleteModal';

const ShippingInquiryList = ({
  inquiries = [],
  onEdit,
  onDelete,
  searchQuery = '',
  viewMode = 'table',
  statusFilter = 'ALL STATUS'
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(null);

  // Filter inquiries based on search query and status filter
  const filteredInquiries = inquiries.filter(inq => {
    const matchesStatus = 
      statusFilter === 'ALL STATUS' ||
      statusFilter === 'ALL' ||
      inq.status?.toUpperCase() === statusFilter.toUpperCase();

    if (!matchesStatus) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (inq.inquiry_no && inq.inquiry_no.toLowerCase().includes(q)) ||
      (inq.customer_name && inq.customer_name.toLowerCase().includes(q)) ||
      (inq.origin && inq.origin.toLowerCase().includes(q)) ||
      (inq.destination && inq.destination.toLowerCase().includes(q)) ||
      (inq.commodity && inq.commodity.toLowerCase().includes(q))
    );
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Active':
        return 'success';
      case 'Quoted':
      case 'In Progress':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
      case 'Inactive':
        return 'danger';
      default:
        return 'success';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'High':
        return 'danger';
      case 'Low':
        return 'secondary';
      case 'Medium':
      default:
        return 'info';
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'Air': return <Plane size={15} style={{ color: '#0288d1' }} />;
      case 'Land': return <Truck size={15} style={{ color: '#ed6c02' }} />;
      default: return <Ship size={15} style={{ color: '#00796b' }} />;
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
      console.error('Failed to delete inquiry:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Column definitions matching standard Company Master Table layout
  const columns = [
    {
      header: 'INQUIRY NO / CUSTOMER',
      key: 'inquiry_no',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--primary, #d32f2f)' }}>{row.inquiry_no}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary, #666)' }}>{row.customer_name || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'ROUTE (ORIGIN → DEST)',
      key: 'route',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={15} style={{ color: '#f57c00', flexShrink: 0 }} />
          <span><strong>{row.origin || '-'}</strong> → <strong>{row.destination || '-'}</strong></span>
        </div>
      )
    },
    {
      header: 'PRODUCT / COMMODITY',
      key: 'commodity',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShoppingBag size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
            <span>{row.commodity || '-'}</span>
          </div>
          {row.container_type && (
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500, marginTop: '2px' }}>
              Type: {row.container_type}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'QTY & WEIGHT / MODE',
      key: 'details',
      render: (row) => (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Package size={15} style={{ color: '#d97706', flexShrink: 0 }} />
            <span>{row.quantity || '-'}</span>
            {row.weight && <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({row.weight})</span>}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '3px' }}>
            {getModeIcon(row.mode)}
            <span style={{ fontWeight: 500 }}>{row.mode || 'Sea'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status || 'Active'}
        </Badge>
      )
    },
    {
      header: 'PRIORITY',
      key: 'priority',
      render: (row) => (
        <Badge variant={getPriorityBadgeVariant(row.priority)}>
          {row.priority || 'Medium'}
        </Badge>
      )
    },
    {
      header: 'ACTIONS',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
          {/* Blue View Icon Button */}
          <button
            className="action-btn view-btn"
            onClick={() => setViewDetailsModal(row)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {/* Green Edit Icon Button */}
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit && onEdit(row)}
            title="Edit Inquiry"
          >
            <Edit2 size={16} />
          </button>
          {/* Red Delete Icon Button */}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onEdit && onEdit(inq)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary, #d32f2f)', fontSize: '0.95rem' }}>
                  {inq.inquiry_no}
                </span>
                <Badge variant={getStatusBadgeVariant(inq.status)}>{inq.status || 'Active'}</Badge>
              </div>

              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#111827' }}>
                {inq.customer_name}
              </h4>
              
              <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} color="#f57c00" />
                  <span><strong>{inq.origin}</strong> → <strong>{inq.destination}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShoppingBag size={15} color="#8b5cf6" />
                  <span>Product: <strong>{inq.commodity || 'N/A'}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', background: '#f9fafb', padding: '0.4rem 0.6rem', borderRadius: '4px', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Package size={14} color="#d97706" /> {inq.quantity || '-'}
                  </span>
                  <span>Wt: {inq.weight || '-'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {getModeIcon(inq.mode)} {inq.mode}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                <button className="action-btn view-btn" onClick={() => setViewDetailsModal(inq)} title="View Details"><Eye size={16} /></button>
                <button className="action-btn edit-btn" onClick={() => onEdit && onEdit(inq)} title="Edit"><Edit2 size={16} /></button>
                <button className="action-btn delete-btn" onClick={(e) => handleDeleteClick(inq, e)} title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {filteredInquiries.length === 0 && (
            <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1' }}>
              No shipping inquiries found. Click "+ Shipping Inquiry" to create one.
            </div>
          )}
        </div>

        {deleteTarget && (
          <ConfirmDeleteModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleConfirmDelete}
            entityName={deleteTarget.inquiry_no}
            isDeleting={isDeleting}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <TableView
        columns={columns}
        data={filteredInquiries}
        isLoading={false}
        emptyStateMsg="No shipping inquiries found. Click '+ Shipping Inquiry' to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />

      {/* Details View Modal */}
      {viewDetailsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setViewDetailsModal(null)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.5rem', maxWidth: '520px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, color: 'var(--primary, #d32f2f)', fontSize: '1.2rem' }}>Shipping Inquiry Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setViewDetailsModal(null)}><X size={18} /></Button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div><strong>Inquiry No:</strong> {viewDetailsModal.inquiry_no}</div>
              <div><strong>Status:</strong> <Badge variant={getStatusBadgeVariant(viewDetailsModal.status)}>{viewDetailsModal.status || 'Active'}</Badge></div>
              <div><strong>Priority:</strong> <Badge variant={getPriorityBadgeVariant(viewDetailsModal.priority)}>{viewDetailsModal.priority || 'Medium'}</Badge></div>
              <div><strong>Customer Name:</strong> {viewDetailsModal.customer_name}</div>
              <div><strong>Transport Mode:</strong> {viewDetailsModal.mode}</div>
              <div><strong>Origin Port/City:</strong> {viewDetailsModal.origin}</div>
              <div><strong>Destination Port/City:</strong> {viewDetailsModal.destination}</div>
              <div><strong>Product / Commodity:</strong> {viewDetailsModal.commodity}</div>
              <div><strong>Container Type:</strong> {viewDetailsModal.container_type || 'N/A'}</div>
              <div><strong>Quantity:</strong> {viewDetailsModal.quantity}</div>
              <div><strong>Weight:</strong> {viewDetailsModal.weight}</div>
              <div><strong>Created Date:</strong> {new Date(viewDetailsModal.created_at || Date.now()).toLocaleDateString()}</div>
            </div>

            {viewDetailsModal.remarks && (
              <div style={{ marginTop: '1rem', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #e5e7eb' }}>
                <strong>Remarks:</strong> {viewDetailsModal.remarks}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" size="sm" onClick={() => setViewDetailsModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          entityName={deleteTarget.inquiry_no}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default ShippingInquiryList;
