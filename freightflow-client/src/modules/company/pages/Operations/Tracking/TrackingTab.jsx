import React, { useState } from 'react';
import { MapPin, CheckCircle2, Clock, Navigation, Plus } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import Badge from '../../../../../shared/components/Badge';

const TrackingTab = ({ shipmentId, jobId }) => {
  const [milestones, setMilestones] = useState([
    { id: 'm-1', name: 'Gate In at Port of Loading', location: 'Nhava Sheva (INNSA)', date: '2026-07-29 10:30 AM', status: 'COMPLETED' },
    { id: 'm-2', name: 'Customs Clearance Approved', location: 'Nhava Sheva Customs', date: '2026-07-30 02:15 PM', status: 'COMPLETED' },
    { id: 'm-3', name: 'Vessel Loaded & Departed', location: 'Nhava Sheva Port', date: '2026-07-31 06:00 AM', status: 'COMPLETED' },
    { id: 'm-4', name: 'Ocean Transit to POD', location: 'Arabian Sea', date: '2026-08-02 (Est)', status: 'PENDING' },
    { id: 'm-5', name: 'Vessel Arrival at Jebel Ali', location: 'Jebel Ali Port (AEJEA)', date: '2026-08-04 (Est)', status: 'PENDING' },
    { id: 'm-6', name: 'Final Delivery to Consignee', location: 'Dubai Free Zone', date: '2026-08-05 (Est)', status: 'PENDING' }
  ]);

  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={18} style={{ color: '#dc2626' }} /> Live Shipment Tracking & Port Milestones
        </h4>
        <Button variant="primary" size="sm" leftIcon={Plus}>Add Milestone Event</Button>
      </div>

      {/* TRACKING TIMELINE */}
      <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #e5e7eb', marginLeft: '12px' }}>
        {milestones.map((m, idx) => {
          const isDone = m.status === 'COMPLETED';
          return (
            <div key={m.id} style={{ position: 'relative', marginBottom: '24px' }}>
              {/* Dot */}
              <div 
                style={{ 
                  position: 'absolute', 
                  left: '-32px', 
                  top: '2px', 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  backgroundColor: isDone ? '#10b981' : '#ffffff', 
                  border: `3px solid ${isDone ? '#059669' : '#d1d5db'}`,
                  boxShadow: isDone ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none'
                }} 
              />

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>{m.name}</h5>
                  <Badge variant={isDone ? 'success' : 'neutral'}>{m.status}</Badge>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} style={{ color: '#dc2626' }} /> {m.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} style={{ color: '#9ca3af' }} /> {m.date}
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

export default TrackingTab;
