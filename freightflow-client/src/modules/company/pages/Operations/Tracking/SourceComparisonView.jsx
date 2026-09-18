import React, { useState } from 'react';
import { 
  Ship, 
  Building2, 
  Layers, 
  Radio, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Anchor,
  FileCheck
} from 'lucide-react';
import Badge from '../../../../../shared/components/Badge/Badge';

const SourceComparisonView = ({ sources }) => {
  const [activeTab, setActiveTab] = useState('ALL');

  if (!sources) return null;

  const { carrier, adani_mundra, dp_world, marine_traffic_ais } = sources;

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

  const tabs = [
    { id: 'ALL', label: 'All 4 Sources' },
    { id: 'CARRIER', label: carrier?.source_name || 'Carrier Portal' },
    { id: 'ADANI', label: 'Adani Mundra' },
    { id: 'DPW', label: 'DP World MICT' },
    { id: 'AIS', label: 'MarineTraffic' },
  ];

  return (
    <div style={{ background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e0e0e0)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      {/* Header & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border, #e0e0e0)' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary, #212121)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Layers size={18} style={{ color: 'var(--primary, #d32f2f)' }} /> Source-by-Source Data Attribution & Audit
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #757575)', margin: '0.2rem 0 0 0' }}>
            Compare raw data across all 4 independent feeds to verify and confirm shipment accuracy.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--background, #f5f7fa)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border, #e0e0e0)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--primary, #d32f2f)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary, #757575)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Cross-Source Attribute Audit Table (When ALL is active) */}
      {activeTab === 'ALL' && (
        <div style={{ marginBottom: '1.25rem', overflowX: 'auto', background: 'var(--background, #f8fafc)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '8px', padding: '0.75rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.775rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border, #cbd5e1)', color: 'var(--text-secondary, #475569)' }}>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>Field</th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>{carrier?.source_name || 'Carrier Manifest'}</th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>Port Berthing Schedule</th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>MarineTraffic AIS</th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700', textAlign: 'center' }}>Match Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>B/L Number</td>
                <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: '700' }}>{carrier?.bl_number || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>{adani_mundra?.success ? `IGM Manifest (${carrier?.bl_number || '-'})` : '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{marine_traffic_ais?.success ? 'AIS Linked' : '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  {carrier?.bl_number ? <span style={{ color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>✅ Verified</span> : '-'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Container No.</td>
                <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: '700' }}>{carrier?.containers?.[0]?.container_number || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{adani_mundra?.success ? (adani_mundra.container_status || 'In Transit') : '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{marine_traffic_ais?.success ? 'Vessel Telemetry' : '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  {carrier?.containers?.[0]?.container_number ? <span style={{ color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>✅ Verified</span> : '-'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Container Size</td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: '#0f172a' }}>{carrier?.containers?.[0]?.container_type || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{adani_mundra?.terminal || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{marine_traffic_ais?.vessel_type || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  {carrier?.containers?.[0]?.container_type ? <span style={{ color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>✅ Verified</span> : '-'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>POL (Origin)</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{carrier?.pol?.name || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{adani_mundra?.success ? 'Foreign Origin' : '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>-</td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  {carrier?.pol?.name ? <span style={{ color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>✅ Verified</span> : '-'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>POD (Destination)</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{carrier?.pod?.name || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{adani_mundra?.port_name || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{marine_traffic_ais?.destination_port || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  {carrier?.pod?.name ? <span style={{ color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>✅ Verified</span> : '-'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Vessel Name</td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>{carrier?.vessel_name || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{adani_mundra?.vessel_name || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{marine_traffic_ais?.vessel_name || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  {carrier?.vessel_name ? <span style={{ color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>✅ Verified</span> : '-'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Voyage Number</td>
                <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>{carrier?.voyage_number || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>{adani_mundra?.inward_voyage || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{carrier?.imo_number ? `IMO ${carrier.imo_number}` : '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  {carrier?.voyage_number ? <span style={{ color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>✅ Verified</span> : '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Current Status</td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: '#15803d' }}>{carrier?.current_status || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#15803d', fontWeight: '600' }}>{adani_mundra?.berthing_status || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#15803d' }}>{marine_traffic_ais?.nav_status || '-'}</td>
                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                  {carrier?.current_status ? <span style={{ color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>✅ Live</span> : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Grid of Sources */}
      <div className="sources-grid">
        
        {/* Source 1: Shipping Line */}
        {(activeTab === 'ALL' || activeTab === 'CARRIER') && (
          <div className="source-card">
            <div>
              <div className="source-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '0.4rem', background: 'rgba(25, 118, 210, 0.1)', color: 'var(--primary)', borderRadius: '6px' }}>
                    <Ship size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                      {carrier?.source_name || 'Carrier Manifest'}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Master Bill of Lading & Carrier EDI Feed</span>
                  </div>
                </div>
                {carrier?.source_url && (
                  <a href={carrier.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', padding: '0.25rem' }}>
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>

              <table className="source-info-table">
                <tbody>
                  <tr><td>Carrier Name:</td><td style={{ fontWeight: '700' }}>{carrier?.shipping_line_name || carrier?.source_name || '-'}</td></tr>
                  <tr><td>Vessel / Voyage:</td><td>{carrier?.vessel_name || '-'} ({carrier?.voyage_number || '-'})</td></tr>
                  <tr><td>Carrier ETA:</td><td style={{ color: 'var(--primary)', fontWeight: '700', fontFamily: 'monospace' }}>{formatDate(carrier?.carrier_eta)}</td></tr>
                  <tr><td>Status:</td><td><Badge variant="success">{carrier?.current_status || 'Active'}</Badge></td></tr>
                  <tr><td>Containers:</td><td style={{ fontFamily: 'monospace' }}>{carrier?.containers?.map(c => c.container_number).join(', ') || '-'}</td></tr>
                  <tr><td>POL / POD:</td><td>{carrier?.pol?.name || '-'} → {carrier?.pod?.name || '-'}</td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ paddingTop: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Source: Carrier Web / API Scan</span>
              <span>{formatDate(carrier?.fetched_at)}</span>
            </div>
          </div>
        )}

        {/* Source 2: Adani Mundra Port */}
        {(activeTab === 'ALL' || activeTab === 'ADANI') && (
          <div className="source-card">
            <div>
              <div className="source-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '0.4rem', background: 'rgba(237, 108, 2, 0.1)', color: '#ed6c02', borderRadius: '6px' }}>
                    <Anchor size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                      Adani Mundra Port Terminal (APSEZ)
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Berthing & Port Schedule</span>
                  </div>
                </div>
                {adani_mundra?.source_url && (
                  <a href={adani_mundra.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', padding: '0.25rem' }}>
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>

              <table className="source-info-table">
                <tbody>
                  <tr><td>Terminal:</td><td style={{ color: '#15803d', fontWeight: '700' }}>{adani_mundra?.terminal || '-'}</td></tr>
                  <tr><td>Berth:</td><td>{adani_mundra?.berth_number || '-'}</td></tr>
                  <tr><td>Port Berthing ETA:</td><td style={{ color: '#b45309', fontWeight: '700', fontFamily: 'monospace' }}>{formatDate(adani_mundra?.port_eta)}</td></tr>
                  <tr><td>Inward Voyage:</td><td>{adani_mundra?.inward_voyage || '-'}</td></tr>
                  <tr><td>Customs Status:</td><td style={{ color: '#15803d' }}>{adani_mundra?.customs_status || '-'}</td></tr>
                  <tr><td>Berthing Status:</td><td><Badge variant={adani_mundra?.berthing_status ? "warning" : "default"}>{adani_mundra?.berthing_status || '-'}</Badge></td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ paddingTop: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Source: APSEZ Berthing Parser</span>
              <span>{formatDate(adani_mundra?.last_report_date)}</span>
            </div>
          </div>
        )}

        {/* Source 3: DP World MICT */}
        {(activeTab === 'ALL' || activeTab === 'DPW') && (
          <div className="source-card">
            <div>
              <div className="source-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '0.4rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '6px' }}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                      DP World Mundra (MICT)
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Vessel Schedule & Container Enquiry</span>
                  </div>
                </div>
                {dp_world?.source_url && (
                  <a href={dp_world.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', padding: '0.25rem' }}>
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>

              <table className="source-info-table">
                <tbody>
                  <tr><td>Terminal:</td><td>{dp_world?.terminal || '-'}</td></tr>
                  <tr><td>MICT ETA:</td><td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{formatDate(dp_world?.port_eta)}</td></tr>
                  <tr><td>Quay Cranes:</td><td>{dp_world?.quay_crane_allocated || '-'}</td></tr>
                  <tr><td>EDI Status:</td><td style={{ color: '#15803d', fontWeight: '600' }}>{dp_world?.container_enquiry_status || '-'}</td></tr>
                  <tr><td>Berthing State:</td><td><Badge variant={dp_world?.berthing_status ? "warning" : "default"}>{dp_world?.berthing_status || '-'}</Badge></td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ paddingTop: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Source: DP World Schedule Scraper</span>
              <span>{formatDate(dp_world?.last_report_date)}</span>
            </div>
          </div>
        )}

        {/* Source 4: MarineTraffic AIS */}
        {(activeTab === 'ALL' || activeTab === 'AIS') && (
          <div className="source-card">
            <div>
              <div className="source-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '0.4rem', background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', borderRadius: '6px' }}>
                    <Radio size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                      MarineTraffic AIS Satellite Radar
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Live AIS Satellite GPS & Telemetry</span>
                  </div>
                </div>
                {marine_traffic_ais?.source_url && (
                  <a href={marine_traffic_ais.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', padding: '0.25rem' }}>
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>

              <table className="source-info-table">
                <tbody>
                  <tr><td>Coordinates:</td><td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{marine_traffic_ais?.latitude ? `${marine_traffic_ais.latitude.toFixed(4)}° N, ${marine_traffic_ais.longitude.toFixed(4)}° E` : '-'}</td></tr>
                  <tr><td>Speed & Course:</td><td>{marine_traffic_ais?.speed_knots ? `${marine_traffic_ais.speed_knots} kts | ${marine_traffic_ais.heading || 0}°` : '-'}</td></tr>
                  <tr><td>Nav Status:</td><td><Badge variant="success">{marine_traffic_ais?.nav_status || '-'}</Badge></td></tr>
                  <tr><td>IMO / MMSI:</td><td style={{ fontFamily: 'monospace' }}>{marine_traffic_ais?.imo_number || '-'} / {marine_traffic_ais?.mmsi_number || '-'}</td></tr>
                  <tr><td>Area:</td><td style={{ color: '#15803d', fontWeight: '600' }}>{marine_traffic_ais?.current_location || '-'}</td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ paddingTop: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Source: MarineTraffic AIS Feed</span>
              <span>{formatDate(marine_traffic_ais?.last_position_received)}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SourceComparisonView;
