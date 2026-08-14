import React from 'react';
import { 
  X, 
  History, 
  Activity,
  MapPin
} from 'lucide-react';
import Badge from '../../../../../shared/components/Badge/Badge';
import Button from '../../../../../shared/components/Button/Button';

const TrackingHistoryModal = ({ isOpen, onClose, tracking }) => {
  if (!isOpen || !tracking) return null;

  const history = tracking.history || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: 'var(--surface, #ffffff)', width: '100%', maxWidth: '680px', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--background, #f5f7fa)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(211, 47, 47, 0.1)', color: 'var(--primary, #d32f2f)', borderRadius: '6px' }}>
              <History size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                  Shipment Tracking Audit Trail
                </h3>
                <Badge variant="primary" style={{ fontFamily: 'monospace' }}>
                  BL: {tracking.bl_number}
                </Badge>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                Timeline of automated tracking updates and staff verifications.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Timeline Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
              <Activity size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>No history logs yet</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Background tracker will append updates when status or location shifts.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {history.map((item, idx) => (
                <div key={item.id || idx} className="milestone-node-row">
                  <div className="milestone-badge-icon completed">
                    <Activity size={14} />
                  </div>

                  <div className="milestone-body" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                            {item.title}
                          </h4>
                          <span style={{ fontSize: '0.65rem', background: '#e2e8f0', padding: '0.1rem 0.35rem', borderRadius: '3px', fontFamily: 'monospace' }}>
                            {item.event_type}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {formatDate(item.createdAt || item.created_at)}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                        {item.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border)', paddingTop: '0.35rem' }}>
                        {item.new_status && <span>Status: <strong style={{ color: 'var(--text-primary)' }}>{item.new_status}</strong></span>}
                        {item.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MapPin size={11} /> {item.location}</span>}
                        {item.source_attribution && <span style={{ marginLeft: 'auto', fontWeight: '600', color: 'var(--primary)' }}>Via: {item.source_attribution}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--background, #f5f7fa)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Mode: <strong style={{ color: 'var(--text-primary)' }}>{tracking.tracking_mode || 'Active_Monitoring'}</strong>
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrackingHistoryModal;
