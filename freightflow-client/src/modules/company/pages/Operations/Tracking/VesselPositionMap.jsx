import React from 'react';
import { 
  Radio, 
  Compass, 
  Gauge, 
  MapPin, 
  ExternalLink, 
  Navigation,
  Anchor
} from 'lucide-react';
import Badge from '../../../../../shared/components/Badge/Badge';

const VesselPositionMap = ({ vesselData }) => {
  if (!vesselData) return null;

  const {
    vessel_name = 'CMA CGM G. WASHINGTON',
    imo_number = '9365790',
    latitude = 22.4582,
    longitude = 69.6421,
    speed_knots = 15.8,
    heading = 345,
    nav_status = 'Underway Using Engine',
    current_location = 'Arabian Sea (Gulf of Kutch Approach)',
    destination_port = 'Mundra, India (INMUN)',
    source_url
  } = vesselData;

  return (
    <div style={{ background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e0e0e0)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border, #e0e0e0)' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary, #212121)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Radio size={18} style={{ color: '#16a34a' }} /> MarineTraffic Satellite Radar & Telemetry
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #757575)', margin: '0.2rem 0 0 0' }}>
            Live AIS telemetry data streamed from terrestrial and satellite marine transponders.
          </p>
        </div>

        {source_url && (
          <a
            href={source_url}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'rgba(211, 47, 47, 0.08)', color: 'var(--primary, #d32f2f)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none' }}
          >
            <span>Open in MarineTraffic Live Map</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Radar Graphic & Metrics Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
        {/* Radar Graphic Box */}
        <div className="radar-display-box">
          <div className="radar-sweep" />

          {/* Top Label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '1px', color: '#38bdf8', textTransform: 'uppercase' }}>
                AIS SATELLITE LIVE TRACK
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(56, 189, 248, 0.7)' }}>
              IMO: {imo_number}
            </span>
          </div>

          {/* Center Vessel Marker */}
          <div className="vessel-center-pin">
            <div 
              className="compass-arrow"
              style={{ transform: `rotate(${heading}deg)` }}
              title={`Heading: ${heading}°`}
            >
              <Navigation size={24} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginTop: '0.5rem' }}>
              {vessel_name}
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#38bdf8', marginTop: '0.15rem' }}>
              {latitude?.toFixed(4)}° N, {longitude?.toFixed(4)}° E
            </div>
          </div>

          {/* Bottom Location Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(56, 189, 248, 0.8)', borderTop: '1px solid rgba(56, 189, 248, 0.2)', paddingTop: '0.5rem', zIndex: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={13} style={{ color: '#38bdf8' }} /> {current_location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Anchor size={13} style={{ color: '#38bdf8' }} /> Destination: {destination_port}
            </span>
          </div>
        </div>

        {/* Telemetry Metrics Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ background: 'var(--background, #f5f7fa)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border, #e0e0e0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Gauge size={15} style={{ color: 'var(--primary)' }} /> Current Speed
              </span>
              <span style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)' }}>
                {speed_knots} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>knots</span>
              </span>
            </div>
            <div style={{ width: '100%', background: 'var(--border, #e0e0e0)', borderRadius: '999px', height: '6px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ background: 'var(--primary, #d32f2f)', height: '6px', width: `${Math.min((speed_knots / 25) * 100, 100)}%`, borderRadius: '999px' }} />
            </div>
          </div>

          <div style={{ background: 'var(--background, #f5f7fa)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border, #e0e0e0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Compass size={15} style={{ color: 'var(--primary)' }} /> Heading & Course
              </span>
              <span style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)' }}>
                {heading}° <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>NNW</span>
              </span>
            </div>
          </div>

          <div style={{ background: 'var(--background, #f5f7fa)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border, #e0e0e0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Radio size={15} style={{ color: 'var(--success, #2e7d32)' }} /> Navigational Status
              </span>
              <Badge variant="success" style={{ fontWeight: '600' }}>
                {nav_status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VesselPositionMap;
