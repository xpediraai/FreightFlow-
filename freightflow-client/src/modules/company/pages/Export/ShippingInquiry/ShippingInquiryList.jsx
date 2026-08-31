import React, { useState } from 'react';
import { Eye, Edit2, Trash2, MapPin, Ship, Package, ShoppingBag, Calendar, FileText, X } from 'lucide-react';
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
    const expName = (inq.exporter_name || inq.customer_name || '').toLowerCase();
    const polName = (inq.pol || inq.origin || '').toLowerCase();
    const podName = (inq.pod || inq.destination || '').toLowerCase();
    const commName = (inq.commodity || '').toLowerCase();
    const hsnCode = (inq.hsn_code || '').toLowerCase();
    const inqNo = (inq.inquiry_no || '').toLowerCase();
    const contType = (inq.container_type || '').toLowerCase();
    const shipLine = (inq.shipping_line_preference || '').toLowerCase();

    return (
      inqNo.includes(q) ||
      expName.includes(q) ||
      polName.includes(q) ||
      podName.includes(q) ||
      commName.includes(q) ||
      hsnCode.includes(q) ||
      contType.includes(q) ||
      shipLine.includes(q)
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

  const getCargoTypeBadgeVariant = (type) => {
    switch (type) {
      case 'Hazardous':
        return 'danger';
      case 'Reefer':
        return 'info';
      case 'OOG':
        return 'warning';
      case 'General':
      default:
        return 'secondary';
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
      header: 'INQUIRY NO / EXPORTER',
      key: 'inquiry_no',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--primary, #1976D2)' }}>{row.inquiry_no}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary, #4b5563)', fontWeight: 500 }}>
            {row.exporter_name || row.customer_name || 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'ROUTE (POL → POD)',
      key: 'route',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
            <MapPin size={14} style={{ color: '#f57c00', flexShrink: 0 }} />
            <span><strong>{row.pol || row.origin || '-'}</strong> → <strong>{row.pod || row.destination || '-'}</strong></span>
          </div>
          {row.fpod && (
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
              FPOD: {row.fpod}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'CARGO / HSN CODE',
      key: 'commodity',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShoppingBag size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
            <span><strong>{row.commodity || '-'}</strong></span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>HSN: {row.hsn_code || 'N/A'}</span>
            {row.cargo_type && (
              <Badge variant={getCargoTypeBadgeVariant(row.cargo_type)} style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                {row.cargo_type}
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'CONTAINERS & WEIGHT',
      key: 'details',
      render: (row) => (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#d97706' }}>
            <Package size={15} style={{ flexShrink: 0 }} />
            <span>{row.no_of_containers || '1'} x {row.container_type || '20\''}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
            Gross Wt: {row.gross_weight || row.weight || '-'}
          </div>
        </div>
      )
    },
    {
      header: 'READY DATE / TERMS',
      key: 'readiness',
      render: (row) => (
        <div>
          <div style={{ fontSize: '0.85rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} style={{ color: '#0288d1' }} />
            <span>Ready: {row.cargo_ready_date ? new Date(row.cargo_ready_date).toLocaleDateString() : '-'}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
            Terms: <strong>{row.shipment_terms || 'FOB'}</strong> | {row.stuffing_location || 'Factory'}
          </div>
        </div>
      )
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status || 'Pending'}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onEdit && onEdit(inq)}
              style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#1976D2', fontSize: '0.95rem' }}>
                  {inq.inquiry_no}
                </span>
                <Badge variant={getStatusBadgeVariant(inq.status)}>{inq.status || 'Pending'}</Badge>
              </div>

              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#111827', fontWeight: 600 }}>
                {inq.exporter_name || inq.customer_name}
              </h4>
              
              <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} color="#f57c00" />
                  <span><strong>{inq.pol || inq.origin}</strong> → <strong>{inq.pod || inq.destination}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShoppingBag size={15} color="#8b5cf6" />
                  <span>Commodity: <strong>{inq.commodity || 'N/A'}</strong> (HSN: {inq.hsn_code || 'N/A'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151', background: '#f9fafb', padding: '0.5rem 0.75rem', borderRadius: '6px', alignItems: 'center', border: '1px solid #f3f4f6' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#d97706' }}>
                    <Package size={14} color="#d97706" /> {inq.no_of_containers || '1'} x {inq.container_type || "20'"}
                  </span>
                  <span style={{ fontSize: '0.8rem' }}>Wt: {inq.gross_weight || inq.weight || '-'}</span>
                  <Badge variant={getCargoTypeBadgeVariant(inq.cargo_type)} style={{ fontSize: '0.7rem' }}>
                    {inq.cargo_type || 'General'}
                  </Badge>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Ready: {inq.cargo_ready_date ? new Date(inq.cargo_ready_date).toLocaleDateString() : '-'} | {inq.shipment_terms || 'FOB'}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="action-btn view-btn" onClick={() => setViewDetailsModal(inq)} title="View Details"><Eye size={16} /></button>
                  <button className="action-btn edit-btn" onClick={() => onEdit && onEdit(inq)} title="Edit"><Edit2 size={16} /></button>
                  <button className="action-btn delete-btn" onClick={(e) => handleDeleteClick(inq, e)} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
          {filteredInquiries.length === 0 && (
            <div className="text-center p-xl text-tertiary w-full" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              No export shipping inquiries found. Click "+ Shipping Inquiry" to create one.
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
        emptyStateMsg="No export shipping inquiries found. Click '+ Shipping Inquiry' to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />

      {/* Details View Modal */}
      {viewDetailsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setViewDetailsModal(null)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.5rem', maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1976D2', fontSize: '1.2rem', fontWeight: 600 }}>Export Shipping Inquiry Details</h3>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{viewDetailsModal.inquiry_no}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewDetailsModal(null)}><X size={18} /></Button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div><strong>Inquiry No:</strong> <span style={{ color: '#1976D2', fontWeight: 600 }}>{viewDetailsModal.inquiry_no}</span></div>
              <div><strong>Status:</strong> <Badge variant={getStatusBadgeVariant(viewDetailsModal.status)}>{viewDetailsModal.status || 'Pending'}</Badge></div>
              <div><strong>Exporter:</strong> {viewDetailsModal.exporter_name || viewDetailsModal.customer_name}</div>
              <div><strong>Priority:</strong> <Badge variant={getPriorityBadgeVariant(viewDetailsModal.priority)}>{viewDetailsModal.priority || 'Medium'}</Badge></div>
              <div><strong>Port of Loading (POL):</strong> {viewDetailsModal.pol || viewDetailsModal.origin}</div>
              <div><strong>Port of Discharge (POD):</strong> {viewDetailsModal.pod || viewDetailsModal.destination}</div>
              <div><strong>Final Place of Delivery (FPOD):</strong> {viewDetailsModal.fpod || 'N/A'}</div>
              <div><strong>Commodity:</strong> {viewDetailsModal.commodity}</div>
              <div><strong>HSN Code:</strong> {viewDetailsModal.hsn_code || 'N/A'}</div>
              <div><strong>Cargo Type:</strong> <Badge variant={getCargoTypeBadgeVariant(viewDetailsModal.cargo_type)}>{viewDetailsModal.cargo_type || 'General'}</Badge></div>
              <div><strong>Container Requirement:</strong> {viewDetailsModal.container_type}</div>
              <div><strong>No. of Containers:</strong> {viewDetailsModal.no_of_containers || '1'}</div>
              <div><strong>Gross Weight (per cont.):</strong> {viewDetailsModal.gross_weight || viewDetailsModal.weight}</div>
              <div><strong>Shipment Terms:</strong> {viewDetailsModal.shipment_terms || 'FOB'}</div>
              <div><strong>Expected Cargo Ready Date:</strong> {viewDetailsModal.cargo_ready_date ? new Date(viewDetailsModal.cargo_ready_date).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Stuffing Location:</strong> {viewDetailsModal.stuffing_location} {viewDetailsModal.stuffing_location === 'Other' && viewDetailsModal.stuffing_location_other ? `(${viewDetailsModal.stuffing_location_other})` : ''}</div>
              <div><strong>Shipping Line Preference:</strong> {viewDetailsModal.shipping_line_preference || 'Any Line'}</div>
              <div><strong>Free Days Required:</strong> {viewDetailsModal.free_days_required ? `${viewDetailsModal.free_days_required} Days` : 'Standard'}</div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Created Date:</strong> {new Date(viewDetailsModal.created_at || Date.now()).toLocaleString()}</div>
            </div>

            {(viewDetailsModal.special_requirements || viewDetailsModal.remarks) && (
              <div style={{ marginTop: '1rem', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #e5e7eb' }}>
                <strong>Special Requirements / Instructions:</strong>
                <p style={{ margin: '0.35rem 0 0 0', color: '#4b5563', whiteSpace: 'pre-wrap' }}>
                  {viewDetailsModal.special_requirements || viewDetailsModal.remarks}
                </p>
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

