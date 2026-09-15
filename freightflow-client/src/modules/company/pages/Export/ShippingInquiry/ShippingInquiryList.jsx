import React, { useState } from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Package,
  ShoppingBag,
  Calendar,
  X,
  Building2,
  Ship,
  ShieldCheck,
  FileCheck,
  Warehouse,
  FileText,
  Clock,
  Layers,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import TableView from '../../../../../shared/components/TableView/TableView';
import Badge from '../../../../../shared/components/Badge/Badge';
import Button from '../../../../../shared/components/Button';
import ConfirmDeleteModal from '../../../../../shared/components/ConfirmDeleteModal/ConfirmDeleteModal';

// ============================================================
// Helpers — support legacy single fields + multi cargo/container
// ============================================================

const getCargoList = (inq) => {
  if (Array.isArray(inq?.cargoDetails) && inq.cargoDetails.length > 0) {
    return inq.cargoDetails;
  }
  // Legacy flat fields
  if (inq?.commodity || inq?.hsn_code || inq?.cargo_type) {
    return [
      {
        commodity: inq.commodity || '',
        hsn_code: inq.hsn_code || '',
        cargo_type: inq.cargo_type || 'General',
        weight_value: '',
        weight_uom: '',
      },
    ];
  }
  return [];
};

const getContainerList = (inq) => {
  if (Array.isArray(inq?.containerDetails) && inq.containerDetails.length > 0) {
    return inq.containerDetails;
  }
  // Legacy flat fields
  if (inq?.container_type || inq?.no_of_containers) {
    return [
      {
        container_type: inq.container_type || "20'",
        no_of_containers: inq.no_of_containers || inq.quantity || '1',
      },
    ];
  }
  return [];
};

const formatCargoWeight = (cargo) => {
  if (cargo?.weight_value) {
    return `${cargo.weight_value} ${cargo.weight_uom || 'KG'}`.trim();
  }
  return '';
};

const formatContainerLine = (c) =>
  `${c.no_of_containers || '1'} x ${c.container_type || "20'"}`;

const formatContainersSummary = (inq) => {
  const list = getContainerList(inq);
  if (!list.length) {
    return `${inq.no_of_containers || '1'} x ${inq.container_type || "20'"}`;
  }
  return list.map(formatContainerLine).join(', ');
};

const formatGrossWeightSummary = (inq) => {
  const cargos = getCargoList(inq);
  const weights = cargos
    .map(formatCargoWeight)
    .filter(Boolean);
  if (weights.length) return weights.join(' · ');
  return inq.gross_weight || inq.weight || '-';
};

// ============================================================
// Component
// ============================================================

const ShippingInquiryList = ({
  inquiries = [],
  isLoading = false,
  onEdit,
  onDelete,
  searchQuery = '',
  viewMode = 'table',
  statusFilter = 'ALL STATUS',
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(null);

  // Filter inquiries based on search query and status filter
  const filteredInquiries = inquiries.filter((inq) => {
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
    const inqNo = (inq.inquiry_no || '').toLowerCase();
    const shipLine = (inq.shipping_line_preference || '').toLowerCase();

    // Multi cargo search
    const cargos = getCargoList(inq);
    const cargoMatch = cargos.some((c) => {
      const commodity = (c.commodity || '').toLowerCase();
      const hsn = (c.hsn_code || '').toLowerCase();
      const type = (c.cargo_type || '').toLowerCase();
      return commodity.includes(q) || hsn.includes(q) || type.includes(q);
    });

    // Multi container search
    const containers = getContainerList(inq);
    const containerMatch = containers.some((c) => {
      const type = (c.container_type || '').toLowerCase();
      return type.includes(q);
    });

    // Legacy single-field fallbacks
    const commName = (inq.commodity || '').toLowerCase();
    const hsnCode = (inq.hsn_code || '').toLowerCase();
    const contType = (inq.container_type || '').toLowerCase();

    return (
      inqNo.includes(q) ||
      expName.includes(q) ||
      polName.includes(q) ||
      podName.includes(q) ||
      cargoMatch ||
      containerMatch ||
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
          <div style={{ fontWeight: 600, color: 'var(--primary, #1976D2)' }}>
            {row.inquiry_no}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-tertiary, #4b5563)',
              fontWeight: 500,
            }}
          >
            {row.exporter_name || row.customer_name || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'ROUTE (POL → POD)',
      key: 'route',
      render: (row) => (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
            }}
          >
            <MapPin size={14} style={{ color: '#f57c00', flexShrink: 0 }} />
            <span>
              <strong>{row.pol || row.origin || '-'}</strong> →{' '}
              <strong>{row.pod || row.destination || '-'}</strong>
            </span>
          </div>
          {row.fpod && (
            <div
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '2px',
              }}
            >
              FPOD: {row.fpod}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'CARGO / HSN CODE',
      key: 'commodity',
      render: (row) => {
        const cargos = getCargoList(row);
        if (!cargos.length) {
          return <span style={{ color: '#9ca3af' }}>-</span>;
        }
        const primary = cargos[0];
        const extra = cargos.length - 1;
        return (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ShoppingBag
                size={14}
                style={{ color: '#8b5cf6', flexShrink: 0 }}
              />
              <span>
                <strong>{primary.commodity || '-'}</strong>
                {extra > 0 && (
                  <span
                    style={{
                      marginLeft: '0.35rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: 500,
                    }}
                  >
                    +{extra} more
                  </span>
                )}
              </span>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#059669',
                fontWeight: 500,
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                flexWrap: 'wrap',
              }}
            >
              <span>HSN: {primary.hsn_code || 'N/A'}</span>
              {primary.cargo_type && (
                <Badge
                  variant={getCargoTypeBadgeVariant(primary.cargo_type)}
                  style={{ fontSize: '0.68rem', padding: '1px 5px' }}
                >
                  {primary.cargo_type}
                </Badge>
              )}
            </div>
            {cargos.length > 1 && (
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#6b7280',
                  marginTop: '2px',
                }}
              >
                {cargos
                  .slice(1)
                  .map((c) => c.commodity || 'Cargo')
                  .join(', ')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'CONTAINERS & WEIGHT',
      key: 'details',
      render: (row) => {
        const containers = getContainerList(row);
        return (
          <div>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.35rem',
                color: '#d97706',
              }}
            >
              <Package size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                {containers.length
                  ? containers.map(formatContainerLine).join(', ')
                  : formatContainersSummary(row)}
              </span>
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: '#6b7280',
                marginTop: '2px',
              }}
            >
              Gross Wt: {formatGrossWeightSummary(row)}
            </div>
          </div>
        );
      },
    },
    {
      header: 'READY DATE / TERMS',
      key: 'readiness',
      render: (row) => (
        <div>
          <div
            style={{
              fontSize: '0.85rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Calendar size={14} style={{ color: '#0288d1' }} />
            <span>
              Ready:{' '}
              {row.cargo_ready_date
                ? new Date(row.cargo_ready_date).toLocaleDateString()
                : '-'}
            </span>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '2px',
            }}
          >
            Terms: <strong>{row.shipment_terms || 'FOB'}</strong> |{' '}
            {row.stuffing_location || 'Factory'}
          </div>
        </div>
      ),
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status || 'Pending'}
        </Badge>
      ),
    },
    {
      header: 'PRIORITY',
      key: 'priority',
      render: (row) => (
        <Badge variant={getPriorityBadgeVariant(row.priority)}>
          {row.priority || 'Medium'}
        </Badge>
      ),
    },
    {
      header: 'ACTIONS',
      key: 'actions',
      render: (row) => (
        <div
          style={{ display: 'flex', gap: '0.5rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="action-btn view-btn"
            onClick={() => setViewDetailsModal(row)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit && onEdit(row)}
            title="Edit Inquiry"
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
      ),
    },
  ];

  // ----------------------------------------------------------
  // Details modal body (shared concept for table + can reuse)
  // ----------------------------------------------------------
  const renderDetailsModal = () => {
    if (!viewDetailsModal) return null;
    const cargos = getCargoList(viewDetailsModal);
    const containers = getContainerList(viewDetailsModal);

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setViewDetailsModal(null)}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '1.5rem',
            maxWidth: '820px',
            width: '92%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '0.75rem',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: '#1976D2',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                }}
              >
                Export Shipping Inquiry Details
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                {viewDetailsModal.inquiry_no}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewDetailsModal(null)}
            >
              <X size={18} />
            </Button>
          </div>

          {/* Details Content Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* 1. Header Summary Card */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Inquiry No
                </span>
                <span style={{ color: '#1976D2', fontWeight: 700, fontSize: '0.95rem' }}>
                  {viewDetailsModal.inquiry_no}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Exporter / Customer
                </span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                  {viewDetailsModal.exporter_name || viewDetailsModal.customer_name || '—'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Status
                </span>
                <Badge variant={getStatusBadgeVariant(viewDetailsModal.status)}>
                  {viewDetailsModal.status || 'Pending'}
                </Badge>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Priority
                </span>
                <Badge variant={getPriorityBadgeVariant(viewDetailsModal.priority)}>
                  {viewDetailsModal.priority || 'Medium'}
                </Badge>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Created Date
                </span>
                <span style={{ color: '#334155' }}>
                  {new Date(viewDetailsModal.created_at || Date.now()).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 2. Routing & Shipment Parameters */}
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#1976D2',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.35rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Ship size={15} />
                Routing & Shipment Terms
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <strong style={{ color: '#475569' }}>Port of Loading (POL):</strong>{' '}
                  <span style={{ color: '#0f172a' }}>{viewDetailsModal.pol || viewDetailsModal.origin || 'N/A'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Port of Discharge (POD):</strong>{' '}
                  <span style={{ color: '#0f172a' }}>{viewDetailsModal.pod || viewDetailsModal.destination || 'N/A'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Final Place of Delivery (FPOD):</strong>{' '}
                  <span style={{ color: '#0f172a' }}>{viewDetailsModal.fpod || 'N/A'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Shipment Type:</strong>{' '}
                  <span style={{ color: '#0f172a' }}>{viewDetailsModal.shipment_type || 'N/A'}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong style={{ color: '#475569' }}>Shipment Sub Type:</strong>{' '}
                  {(() => {
                    const subTypes = Array.isArray(viewDetailsModal.shipment_sub_type)
                      ? viewDetailsModal.shipment_sub_type
                      : typeof viewDetailsModal.shipment_sub_type === 'string' && viewDetailsModal.shipment_sub_type.trim()
                      ? viewDetailsModal.shipment_sub_type.startsWith('[')
                        ? (() => { try { return JSON.parse(viewDetailsModal.shipment_sub_type); } catch { return [viewDetailsModal.shipment_sub_type]; } })()
                        : viewDetailsModal.shipment_sub_type.includes(',')
                        ? viewDetailsModal.shipment_sub_type.split(',').map((s) => s.trim()).filter(Boolean)
                        : [viewDetailsModal.shipment_sub_type]
                      : [];
                    if (!subTypes || subTypes.length === 0) return <span style={{ color: '#94a3b8' }}>N/A</span>;
                    return (
                      <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '4px', verticalAlign: 'middle', marginLeft: '4px' }}>
                        {subTypes.map((st, i) => (
                          <span
                            key={i}
                            style={{
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              border: '1px solid #bae6fd',
                            }}
                          >
                            {st}
                          </span>
                        ))}
                      </span>
                    );
                  })()}
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Shipment Terms (Incoterms):</strong>{' '}
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{viewDetailsModal.shipment_terms || 'FOB'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Expected Cargo Ready Date:</strong>{' '}
                  <span style={{ color: '#0f172a' }}>
                    {viewDetailsModal.cargo_ready_date
                      ? new Date(viewDetailsModal.cargo_ready_date).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Shipping Line Preference:</strong>{' '}
                  <span style={{ color: '#0f172a' }}>{viewDetailsModal.shipping_line_preference || 'Any Line'}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Free Days Required:</strong>{' '}
                  <span style={{ color: '#0f172a' }}>
                    {viewDetailsModal.free_days_required ? `${viewDetailsModal.free_days_required} Days` : 'Standard'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Stuffing Location & Factory Information */}
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#1976D2',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.35rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Warehouse size={15} />
                Stuffing Location & Factory Information
              </div>

              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#475569' }}>Stuffing Location:</strong>{' '}
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{viewDetailsModal.stuffing_location || 'Factory'}</span>
                  {viewDetailsModal.stuffing_location === 'Other' && viewDetailsModal.stuffing_location_other && (
                    <span style={{ color: '#64748b' }}> ({viewDetailsModal.stuffing_location_other})</span>
                  )}
                </div>

                {(viewDetailsModal.factory_name ||
                  viewDetailsModal.factory_address ||
                  viewDetailsModal.factory_contact_person ||
                  viewDetailsModal.factory_details?.factory_name) && (
                  <div
                    style={{
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                    }}
                  >
                    <div style={{ color: '#0288d1', fontWeight: 600 }}>
                      🏭 {viewDetailsModal.factory_name || viewDetailsModal.factory_details?.factory_name || 'Factory Plant'}
                    </div>
                    {(viewDetailsModal.factory_address || viewDetailsModal.factory_details?.factory_address) && (
                      <div style={{ color: '#334155' }}>
                        📍 <strong>Address:</strong> {viewDetailsModal.factory_address || viewDetailsModal.factory_details?.factory_address}
                        {(viewDetailsModal.factory_city || viewDetailsModal.factory_details?.city) &&
                          `, ${viewDetailsModal.factory_city || viewDetailsModal.factory_details?.city}`}
                        {(viewDetailsModal.factory_state || viewDetailsModal.factory_details?.state) &&
                          `, ${viewDetailsModal.factory_state || viewDetailsModal.factory_details?.state}`}
                        {(viewDetailsModal.factory_pincode || viewDetailsModal.factory_details?.pincode) &&
                          ` - ${viewDetailsModal.factory_pincode || viewDetailsModal.factory_details?.pincode}`}
                      </div>
                    )}
                    {(viewDetailsModal.factory_contact_person || viewDetailsModal.factory_details?.contact_person) && (
                      <div style={{ color: '#334155' }}>
                        👤 <strong>Contact Person:</strong> {viewDetailsModal.factory_contact_person || viewDetailsModal.factory_details?.contact_person}
                        {(viewDetailsModal.factory_details?.contact_phone) &&
                          ` (${viewDetailsModal.factory_details?.contact_phone})`}
                      </div>
                    )}
                    {viewDetailsModal.factory_details?.gstin && (
                      <div style={{ color: '#334155' }}>
                        🔖 <strong>GSTIN:</strong> {viewDetailsModal.factory_details?.gstin}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Operations, Handling & Special Services */}
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#1976D2',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.35rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <ShieldCheck size={15} />
                Handling, Compliance & Special Services
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.65rem',
                  fontSize: '0.825rem',
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '2px' }}>Inspections:</strong>
                  <span style={{ color: viewDetailsModal.inspections ? '#0f172a' : '#94a3b8' }}>
                    {viewDetailsModal.inspections || 'None specified'}
                  </span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '2px' }}>Certifications:</strong>
                  <span style={{ color: viewDetailsModal.certifications ? '#0f172a' : '#94a3b8' }}>
                    {viewDetailsModal.certifications || 'None specified'}
                  </span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '2px' }}>Fumigations:</strong>
                  <span style={{ color: viewDetailsModal.fumigations ? '#0f172a' : '#94a3b8' }}>
                    {viewDetailsModal.fumigations || 'None specified'}
                  </span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '2px' }}>Loading / Unloading:</strong>
                  <span style={{ color: viewDetailsModal.loading_unloading ? '#0f172a' : '#94a3b8' }}>
                    {viewDetailsModal.loading_unloading || 'Standard'}
                  </span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '2px' }}>Palletization:</strong>
                  <span style={{ color: viewDetailsModal.palletization ? '#0f172a' : '#94a3b8' }}>
                    {viewDetailsModal.palletization || 'None specified'}
                  </span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '2px' }}>Lashing & Chocking:</strong>
                  <span style={{ color: viewDetailsModal.lashing_chocking ? '#0f172a' : '#94a3b8' }}>
                    {viewDetailsModal.lashing_chocking || 'None specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Cargo Details (multi) */}
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#1976D2',
                  marginBottom: '0.65rem',
                  paddingBottom: '0.35rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <ShoppingBag size={15} />
                Cargo Details ({cargos.length || 0})
              </div>
              {cargos.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  No cargo lines specified
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cargos.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {idx + 1}. {c.commodity || '—'}
                        </span>
                        <Badge
                          variant={getCargoTypeBadgeVariant(c.cargo_type || 'General')}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {c.cargo_type || 'General'}
                        </Badge>
                      </div>
                      <div
                        style={{
                          marginTop: '0.35rem',
                          color: '#475569',
                          display: 'flex',
                          gap: '1.25rem',
                          flexWrap: 'wrap',
                          fontSize: '0.8rem',
                        }}
                      >
                        <span>
                          <strong>HSN Code:</strong> {c.hsn_code || 'N/A'}
                        </span>
                        <span>
                          <strong>Weight:</strong>{' '}
                          {formatCargoWeight(c) ||
                            viewDetailsModal.gross_weight ||
                            viewDetailsModal.weight ||
                            '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Container Requirements (multi) */}
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#1976D2',
                  marginBottom: '0.65rem',
                  paddingBottom: '0.35rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Package size={15} />
                Container Requirements ({containers.length || 0})
              </div>
              {containers.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  No container lines specified
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {containers.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '6px',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#b45309',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>{idx + 1}.</span> {formatContainerLine(c)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Special Requirements / Instructions */}
            {(viewDetailsModal.special_requirements || viewDetailsModal.remarks) && (
              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#1976D2',
                    marginBottom: '0.5rem',
                    paddingBottom: '0.35rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <FileText size={15} />
                  Special Requirements / Instructions
                </div>
                <p
                  style={{
                    margin: 0,
                    color: '#334155',
                    fontSize: '0.85rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                  }}
                >
                  {viewDetailsModal.special_requirements || viewDetailsModal.remarks}
                </p>
              </div>
            )}

          </div>

          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '0.75rem',
            }}
          >
            <Button
              variant="primary"
              size="sm"
              onClick={() => setViewDetailsModal(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------
  // Card view
  // ----------------------------------------------------------
  if (viewMode === 'card') {
    return (
      <div style={{ padding: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredInquiries.map((inq) => {
            const cargos = getCargoList(inq);
            const containers = getContainerList(inq);
            const primaryCargo = cargos[0];

            return (
              <div
                key={inq.id}
                className="bg-surface border-light rounded-lg shadow-sm p-lg cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onEdit && onEdit(inq)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: '#1976D2',
                      fontSize: '0.95rem',
                    }}
                  >
                    {inq.inquiry_no}
                  </span>
                  <Badge variant={getStatusBadgeVariant(inq.status)}>
                    {inq.status || 'Pending'}
                  </Badge>
                </div>

                <h4
                  style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1rem',
                    color: '#111827',
                    fontWeight: 600,
                  }}
                >
                  {inq.exporter_name || inq.customer_name}
                </h4>

                <div
                  style={{
                    fontSize: '0.85rem',
                    color: '#4b5563',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <MapPin size={15} color="#f57c00" />
                    <span>
                      <strong>{inq.pol || inq.origin || '-'}</strong> →{' '}
                      <strong>{inq.pod || inq.destination || '-'}</strong>
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.4rem',
                    }}
                  >
                    <ShoppingBag
                      size={15}
                      color="#8b5cf6"
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                    <span>
                      {primaryCargo ? (
                        <>
                          <strong>{primaryCargo.commodity || 'N/A'}</strong>
                          {cargos.length > 1 && (
                            <span style={{ color: '#6b7280' }}>
                              {' '}
                              (+{cargos.length - 1} more)
                            </span>
                          )}
                          <span style={{ color: '#6b7280' }}>
                            {' '}
                            · HSN: {primaryCargo.hsn_code || 'N/A'}
                          </span>
                        </>
                      ) : (
                        'No cargo'
                      )}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#374151',
                      background: '#f9fafb',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      alignItems: 'center',
                      border: '1px solid #f3f4f6',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontWeight: 600,
                        color: '#d97706',
                      }}
                    >
                      <Package size={14} color="#d97706" />{' '}
                      {containers.length
                        ? containers.map(formatContainerLine).join(', ')
                        : formatContainersSummary(inq)}
                    </span>
                    <span style={{ fontSize: '0.8rem' }}>
                      Wt: {formatGrossWeightSummary(inq)}
                    </span>
                    {primaryCargo?.cargo_type && (
                      <Badge
                        variant={getCargoTypeBadgeVariant(
                          primaryCargo.cargo_type
                        )}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {primaryCargo.cargo_type}
                      </Badge>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '0.75rem',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Ready:{' '}
                    {inq.cargo_ready_date
                      ? new Date(inq.cargo_ready_date).toLocaleDateString()
                      : '-'}{' '}
                    | {inq.shipment_terms || 'FOB'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="action-btn view-btn"
                      onClick={() => setViewDetailsModal(inq)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit && onEdit(inq)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => handleDeleteClick(inq, e)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredInquiries.length === 0 && (
            <div
              className="text-center p-xl text-tertiary w-full"
              style={{
                gridColumn: '1 / -1',
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280',
              }}
            >
              No export shipping inquiries found. Click &quot;+ Shipping
              Inquiry&quot; to create one.
            </div>
          )}
        </div>

        {renderDetailsModal()}

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

  // ----------------------------------------------------------
  // Table view
  // ----------------------------------------------------------
  return (
    <>
      <TableView
        columns={columns}
        data={filteredInquiries}
        isLoading={isLoading}
        emptyStateMsg="No export shipping inquiries found. Click '+ Shipping Inquiry' to get started."
        onRowClick={(row) => onEdit && onEdit(row)}
      />

      {renderDetailsModal()}

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