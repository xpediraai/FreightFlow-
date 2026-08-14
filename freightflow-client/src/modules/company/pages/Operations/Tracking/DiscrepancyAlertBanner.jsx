import React from 'react';
import { AlertTriangle, Check, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import Badge from '../../../../../shared/components/Badge/Badge';

const DiscrepancyAlertBanner = ({
  discrepancies = [],
  confidenceScore = 'HIGH',
  overrideValues = {},
  onOverrideChange
}) => {
  if (!discrepancies || discrepancies.length === 0) {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#14532d', margin: 0 }}>
              100% Cross-Source Consistency Verified
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#166534', margin: '0.15rem 0 0 0' }}>
              Carrier portal, Adani Mundra Port reports, DP World MICT and MarineTraffic AIS data match seamlessly.
            </p>
          </div>
        </div>
        <Badge variant="success" style={{ fontWeight: '700', textTransform: 'uppercase' }}>
          High Confidence
        </Badge>
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="discrepancy-box">
      {/* Header */}
      <div className="discrepancy-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: '#f59e0b', color: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#78350f', margin: 0 }}>
                Discrepancy Detection: {discrepancies.length} Variance(s) Identified
              </h3>
              <Badge variant="warning" style={{ fontSize: '0.7rem', fontWeight: '700' }}>
                Review Required
              </Badge>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#92400e', margin: '0.2rem 0 0 0', fontWeight: '500' }}>
              FreightFlow cross-verifies multiple sources and flags differences. Select the verified value below to confirm.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: '700', display: 'block' }}>Confidence:</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', background: '#fde68a', color: '#78350f', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            {confidenceScore}
          </span>
        </div>
      </div>

      {/* Discrepancy Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {discrepancies.map((disc, idx) => (
          <div key={disc.id || idx} className="discrepancy-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} style={{ color: '#d97706' }} />
                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {disc.title}
                </h4>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', background: disc.severity === 'HIGH' ? '#fee2e2' : '#fef3c7', color: disc.severity === 'HIGH' ? '#b91c1c' : '#b45309', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                  {disc.severity} Priority
                </span>
              </div>

              {disc.suggested_reason && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  <HelpCircle size={13} style={{ color: 'var(--primary)' }} />
                  <span>{disc.suggested_reason}</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: '0 0 0.5rem 0' }}>
              {disc.description}
            </p>

            {/* Field Resolution Options */}
            {disc.field === 'eta' && disc.source_values && (
              <div className="discrepancy-options">
                {disc.source_values.carrier_eta && (
                  <label className="discrepancy-radio-label">
                    <input
                      type="radio"
                      name={`override_${disc.field}`}
                      checked={overrideValues?.eta === disc.source_values.carrier_eta}
                      onChange={() => onOverrideChange('eta', disc.source_values.carrier_eta)}
                    />
                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: '700', color: '#374151', display: 'block' }}>Shipping Line ETA</span>
                      <span style={{ fontFamily: 'monospace', color: '#6b7280' }}>
                        {formatDate(disc.source_values.carrier_eta)}
                      </span>
                    </div>
                  </label>
                )}

                {disc.source_values.port_eta && (
                  <label className="discrepancy-radio-label" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
                    <input
                      type="radio"
                      name={`override_${disc.field}`}
                      checked={overrideValues?.eta === disc.source_values.port_eta || !overrideValues?.eta}
                      onChange={() => onOverrideChange('eta', disc.source_values.port_eta)}
                    />
                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: '700', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Port Berthing ETA <Sparkles size={11} style={{ color: '#f59e0b' }} />
                      </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#15803d' }}>
                        {formatDate(disc.source_values.port_eta)}
                      </span>
                    </div>
                  </label>
                )}

                {disc.source_values.ais_eta && (
                  <label className="discrepancy-radio-label">
                    <input
                      type="radio"
                      name={`override_${disc.field}`}
                      checked={overrideValues?.eta === disc.source_values.ais_eta}
                      onChange={() => onOverrideChange('eta', disc.source_values.ais_eta)}
                    />
                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: '700', color: '#374151', display: 'block' }}>MarineTraffic AIS ETA</span>
                      <span style={{ fontFamily: 'monospace', color: '#6b7280' }}>
                        {formatDate(disc.source_values.ais_eta)}
                      </span>
                    </div>
                  </label>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscrepancyAlertBanner;
