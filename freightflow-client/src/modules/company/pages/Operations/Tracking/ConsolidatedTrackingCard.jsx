import React from 'react';
import { 
  Ship, 
  Anchor, 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Badge from '../../../../../shared/components/Badge/Badge';
import Button from '../../../../../shared/components/Button/Button';

const ConsolidatedTrackingCard = ({
  consolidated,
  onConfirm,
  isConfirming,
  hasDiscrepancies
}) => {
  if (!consolidated) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  const getDaysRemaining = (dateStr, status) => {
    if (status?.toLowerCase().includes('completed') || status?.toLowerCase().includes('gated out') || status?.toLowerCase().includes('gate out')) {
      return 'Delivered / Gated Out';
    }
    if (!dateStr) return '';
    const diffMs = new Date(dateStr) - new Date();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Arrived at POD';
    if (diffDays === 0) return 'Arriving Today';
    if (diffDays === 1) return 'Arriving Tomorrow';
    return `In ~${diffDays} days`;
  };

  return (
    <div className="consolidated-card">
      {/* Top Banner */}
      <div className="consolidated-top-banner">
        <div className="banner-left">
          <div className="banner-ship-icon">
            <Ship size={26} />
          </div>
          <div className="banner-details">
            <div className="banner-tags">
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary, #757575)', textTransform: 'uppercase' }}>
                {consolidated.shipping_line_name}
              </span>
              <Badge variant="primary" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                BL: {consolidated.bl_number}
              </Badge>
              <Badge variant="success" style={{ fontWeight: '600' }}>
                {consolidated.shipment_status || 'In Transit'}
              </Badge>
            </div>
            {consolidated.vessels && consolidated.vessels.length > 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                {consolidated.vessels.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', background: i === 0 ? 'rgba(25, 118, 210, 0.12)' : 'rgba(237, 108, 2, 0.12)', color: i === 0 ? 'var(--primary)' : '#ed6c02', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                      {v.leg_type || (i === 0 ? '1st Leg (Origin)' : 'Connecting / Ocean')}
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {v.vessel_name}
                    </span>
                    {v.voyage_number && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        (Voyage: <strong style={{ color: 'var(--text-primary)' }}>{v.voyage_number}</strong>)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <h2>
                {consolidated.vessel_name || '-'}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--text-secondary, #757575)' }}>
                  (Voyage: <strong style={{ color: 'var(--text-primary, #212121)' }}>{consolidated.voyage_number || '-'}</strong>)
                </span>
              </h2>
            )}
          </div>
        </div>


        {/* Verification Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {hasDiscrepancies && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '0.4rem 0.75rem', borderRadius: '6px', fontWeight: '600', border: '1px solid #fde68a' }}>
              <AlertTriangle size={15} />
              <span>Discrepancy Detected Below</span>
            </div>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="tracking-submit-btn"
            style={{ height: '40px', padding: '0 1.25rem', background: 'var(--success, #2e7d32)' }}
          >
            <ShieldCheck size={18} />
            <span>{isConfirming ? 'Saving...' : 'Confirm & Monitor Shipment'}</span>
          </button>
        </div>
      </div>

      {/* Body Grid */}
      <div className="consolidated-grid">
        {/* Route Details */}
        <div className="consolidated-col">
          <span className="col-heading">
            <MapPin size={14} style={{ color: 'var(--primary, #d32f2f)' }} /> Route (POL → POD)
          </span>
          <div className="route-display">
            <div className="port-box">
              <p className="port-label">Origin (POL)</p>
              <p className="port-name">{consolidated.pol?.name || '-'}</p>
              {consolidated.pol?.code && <span className="port-code">{consolidated.pol.code}</span>}
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-secondary, #757575)', flexShrink: 0 }} />
            <div className="port-box">
              <p className="port-label">Destination (POD)</p>
              <p className="port-name">{consolidated.pod?.name || '-'}</p>
              {consolidated.pod?.code && <span className="port-code highlight">{consolidated.pod.code}</span>}
            </div>
          </div>
        </div>

        {/* ETA & Arrival Window */}
        <div className="consolidated-col">
          <span className="col-heading">
            <Calendar size={14} style={{ color: 'var(--primary, #d32f2f)' }} /> Consolidated Best ETA
          </span>
          <div>
            <div className="eta-value">{formatDate(consolidated.consolidated_eta)}</div>
            {consolidated.consolidated_eta && (
              <div className="eta-countdown">
                <Clock size={13} />
                <span>{getDaysRemaining(consolidated.consolidated_eta, consolidated.shipment_status)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Location / Coordinates */}
        <div className="consolidated-col">
          <span className="col-heading">
            <Anchor size={14} style={{ color: 'var(--primary, #d32f2f)' }} /> Location & Telemetry
          </span>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary, #212121)', margin: '0 0 0.25rem 0' }}>
              {consolidated.current_location || 'En Route'}
            </p>
            {consolidated.latitude ? (
              <>
                <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary, #757575)', margin: 0 }}>
                  Lat: <strong style={{ color: 'var(--text-primary)' }}>{consolidated.latitude?.toFixed(4)}° N</strong>, Lon: <strong style={{ color: 'var(--text-primary)' }}>{consolidated.longitude?.toFixed(4)}° E</strong>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Speed: <strong>{consolidated.speed_knots || 0} kts</strong> | Nav: <strong style={{ color: 'var(--success, #2e7d32)' }}>{consolidated.nav_status || 'Underway'}</strong>
                </p>
              </>
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Status: <strong style={{ color: 'var(--success)' }}>{consolidated.shipment_status || 'In Transit'}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Containers Summary */}
        <div className="consolidated-col">
          <span className="col-heading">
            <Package size={14} style={{ color: 'var(--primary, #d32f2f)' }} /> Containers ({consolidated.containers?.length || 0})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
            {(consolidated.containers || []).map((c) => (
              <div 
                key={c.container_number}
                style={{ background: 'var(--background, #f8fafc)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border, #e2e8f0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.825rem', fontFamily: 'monospace', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {c.container_number}
                  </span>
                  <span style={{ fontSize: '0.7rem', background: '#e2e8f0', color: '#334155', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                    {c.container_type || '40HC'}
                  </span>
                </div>
                {c.cargo_weight && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{c.package_count || 'Package Goods'}</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{c.cargo_weight}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedTrackingCard;
