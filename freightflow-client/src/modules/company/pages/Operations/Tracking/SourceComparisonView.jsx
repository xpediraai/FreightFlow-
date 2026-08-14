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
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

      {/* Grid of Sources */}
      <div className="sources-grid">
        
        {/* Source 1: Shipping Line */}
        {(activeTab === 'ALL' || activeTab === 'CARRIER') && (
          <div className="source-card">
            <div>
              <div className="source-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '0.4rem', background: 'rgba(2, 136, 209, 0.1)', color: '#0288d1', borderRadius: '6px' }}>
                    <Ship size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                      {carrier?.source_name || 'Carrier Manifest'}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Carrier Portal Manifest</span>
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
                  <tr><td>BL Number:</td><td>{carrier?.bl_number}</td></tr>
                  <tr><td>Vessel & Voyage:</td><td>{carrier?.vessel_name} ({carrier?.voyage_number})</td></tr>
                  <tr><td>Carrier ETA:</td><td style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{formatDate(carrier?.carrier_eta)}</td></tr>
                  <tr><td>Route:</td><td>{carrier?.pol?.name} → {carrier?.pod?.name}</td></tr>
                  <tr><td>Status:</td><td><Badge variant="success">{carrier?.current_status}</Badge></td></tr>
                </tbody>
              </table>

              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Containers ({carrier?.containers?.length || 0}):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {(carrier?.containers || []).map((cont) => (
                    <div key={cont.container_number} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--background)', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{cont.container_number} ({cont.container_type})</span>
                      <span style={{ color: 'var(--success)', fontWeight: '600' }}>{cont.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ paddingTop: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Source: Official Web Feed</span>
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
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                      Adani Mundra Port Terminal (APSEZ)
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Berthing & Daily Movement Report</span>
                  </div>
                </div>
                <a href="https://www.adaniports.com/ports-and-terminals/mundra-port/download" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', padding: '0.25rem' }}>
                  <ExternalLink size={15} />
                </a>
              </div>

              <table className="source-info-table">
                <tbody>
                  <tr><td>Terminal:</td><td style={{ color: '#15803d', fontWeight: '700' }}>{adani_mundra?.terminal || 'CT3 (AMCT)'}</td></tr>
                  <tr><td>Berth:</td><td>{adani_mundra?.berth_number || 'Berth 04'}</td></tr>
                  <tr><td>Port Berthing ETA:</td><td style={{ color: '#b45309', fontWeight: '700', fontFamily: 'monospace' }}>{formatDate(adani_mundra?.port_eta)}</td></tr>
                  <tr><td>Inward Voyage:</td><td>{adani_mundra?.inward_voyage}</td></tr>
                  <tr><td>Customs Status:</td><td style={{ color: '#15803d' }}>{adani_mundra?.customs_status || 'IGM Manifest Logged'}</td></tr>
                  <tr><td>Berthing Status:</td><td><Badge variant="warning">{adani_mundra?.berthing_status || 'Scheduled'}</Badge></td></tr>
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
                <a href="https://www.dpworld.com/en/ports-terminals/india/mict/berthing-report" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', padding: '0.25rem' }}>
                  <ExternalLink size={15} />
                </a>
              </div>

              <table className="source-info-table">
                <tbody>
                  <tr><td>Terminal Window:</td><td>{dp_world?.berth_window || 'Window 2 (North Quay)'}</td></tr>
                  <tr><td>MICT ETA:</td><td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{formatDate(dp_world?.port_eta)}</td></tr>
                  <tr><td>Quay Cranes:</td><td>{dp_world?.quay_crane_allocated || 'QC-03, QC-04'}</td></tr>
                  <tr><td>EDI Status:</td><td style={{ color: '#15803d', fontWeight: '600' }}>{dp_world?.container_enquiry_status || 'EDI Manifest Received'}</td></tr>
                  <tr><td>Berthing State:</td><td><Badge variant="warning">{dp_world?.berthing_status || 'Expected'}</Badge></td></tr>
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
                  <tr><td>Coordinates:</td><td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{marine_traffic_ais?.latitude?.toFixed(4)}° N, {marine_traffic_ais?.longitude?.toFixed(4)}° E</td></tr>
                  <tr><td>Speed & Course:</td><td>{marine_traffic_ais?.speed_knots} kts | {marine_traffic_ais?.heading}°</td></tr>
                  <tr><td>Nav Status:</td><td><Badge variant="success">{marine_traffic_ais?.nav_status || 'Underway'}</Badge></td></tr>
                  <tr><td>IMO / MMSI:</td><td style={{ fontFamily: 'monospace' }}>{marine_traffic_ais?.imo_number} / {marine_traffic_ais?.mmsi_number}</td></tr>
                  <tr><td>Area:</td><td style={{ color: '#15803d', fontWeight: '600' }}>{marine_traffic_ais?.current_location}</td></tr>
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
