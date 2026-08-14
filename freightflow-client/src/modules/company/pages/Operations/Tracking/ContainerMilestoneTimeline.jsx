import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  Package, 
  MapPin, 
  Calendar 
} from 'lucide-react';
import Badge from '../../../../../shared/components/Badge/Badge';

const ContainerMilestoneTimeline = ({ containers = [] }) => {
  const [selectedContainer, setSelectedContainer] = useState(containers[0]?.container_number || '');

  if (!containers || containers.length === 0) return null;

  const currentContainer = containers.find((c) => c.container_number === selectedContainer) || containers[0];

  const formatDate = (d) => {
    if (!d) return 'Pending';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="milestones-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border, #e0e0e0)' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary, #212121)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Package size={18} style={{ color: 'var(--primary, #d32f2f)' }} /> Container Lifecycle & Milestone Timeline
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #757575)', margin: '0.2rem 0 0 0' }}>
            Milestone progress tracking from origin port to discharge and delivery.
          </p>
        </div>

        {/* Container Selector Tabs */}
        {containers.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Select Container:</span>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--background)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              {containers.map((c) => (
                <button
                  key={c.container_number}
                  type="button"
                  onClick={() => setSelectedContainer(c.container_number)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    background: currentContainer.container_number === c.container_number ? 'var(--primary, #d32f2f)' : 'transparent',
                    color: currentContainer.container_number === c.container_number ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {c.container_number}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Container Header Info */}
      <div style={{ background: 'var(--background, #f5f7fa)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border, #e0e0e0)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(211, 47, 47, 0.1)', color: 'var(--primary, #d32f2f)', borderRadius: '6px' }}>
            <Package size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: '800', color: 'var(--text-primary)' }}>
                {currentContainer.container_number}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#475569' }}>
                Type: {currentContainer.container_type || '40HC'}
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                Seal: {currentContainer.seal_number || 'N/A'}
              </span>
              {currentContainer.cargo_weight && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  Wt: {currentContainer.cargo_weight}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
              Current Location: <strong style={{ color: 'var(--text-primary)' }}>{currentContainer.last_location || 'At Sea'}</strong>
              {currentContainer.last_movement && (
                <span style={{ color: 'var(--success, #2e7d32)', marginLeft: '0.5rem', fontWeight: '600' }}>
                  • {currentContainer.last_movement}
                </span>
              )}
            </p>
          </div>
        </div>

        <Badge variant="success" style={{ fontWeight: '700', padding: '0.35rem 0.75rem' }}>
          {currentContainer.status || 'In Transit'}
        </Badge>
      </div>

      {/* Visual Timeline Tracker */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(currentContainer.milestones || []).map((m, idx) => {
          const isCompleted = m.status === 'Completed';
          const isInProgress = m.status === 'In Progress';

          return (
            <div key={idx} className="milestone-node-row">
              <div
                className={`milestone-badge-icon ${
                  isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'estimated'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} />
                ) : isInProgress ? (
                  <Clock size={16} />
                ) : (
                  <Circle size={12} />
                )}
              </div>

              <div className="milestone-body">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                      {m.event}
                    </h4>
                    <Badge variant={isCompleted ? 'success' : isInProgress ? 'primary' : 'secondary'} style={{ fontSize: '0.65rem' }}>
                      {m.status}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} style={{ color: 'var(--primary)' }} /> {m.location}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                    {formatDate(m.date)}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {isCompleted ? 'Actual' : 'Estimated'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContainerMilestoneTimeline;
