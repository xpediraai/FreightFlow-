import React, { useState } from 'react';
import { Calendar, Ship, Clock, CheckCircle } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import Badge from '../../../../../shared/components/Badge';

const BookingTab = ({ shipmentId, jobId }) => {
  const [booking, setBooking] = useState({
    booking_number: 'BKG-202607-9941',
    booking_date: '2026-07-28',
    vessel_name: 'MSC ISABELLA',
    voyage_number: 'V.2026E',
    shipping_line: 'Maersk Line / MSC',
    si_cutoff: '2026-08-02 18:00',
    vgm_cutoff: '2026-08-03 12:00',
    gatein_cutoff: '2026-08-04 08:00',
    status: 'CONFIRMED'
  });

  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ship size={18} style={{ color: '#dc2626' }} /> Carrier Booking & Cut-Off Schedules
        </h4>
        <Badge variant="success">BOOKING CONFIRMED</Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* BOOKING DETAILS CARD */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Vessel & Booking Info
          </h5>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 0', color: '#6b7280', fontWeight: '500' }}>Booking No:</td>
                <td style={{ padding: '8px 0', fontWeight: '700', color: '#111827', textAlign: 'right' }}>{booking.booking_number}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 0', color: '#6b7280', fontWeight: '500' }}>Shipping Line:</td>
                <td style={{ padding: '8px 0', fontWeight: '600', color: '#111827', textAlign: 'right' }}>{booking.shipping_line}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 0', color: '#6b7280', fontWeight: '500' }}>Vessel / Voyage:</td>
                <td style={{ padding: '8px 0', fontWeight: '600', color: '#111827', textAlign: 'right' }}>{booking.vessel_name} ({booking.voyage_number})</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b7280', fontWeight: '500' }}>Booking Date:</td>
                <td style={{ padding: '8px 0', fontWeight: '600', color: '#111827', textAlign: 'right' }}>{booking.booking_date}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CUT-OFF TIMINGS CARD */}
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Cut-Off Deadlines
          </h5>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 0', color: '#374151', fontWeight: '600' }}>SI Cut-Off Date:</td>
                <td style={{ padding: '8px 0', fontWeight: '700', color: '#dc2626', textAlign: 'right' }}>{booking.si_cutoff}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 0', color: '#374151', fontWeight: '600' }}>VGM Cut-Off Date:</td>
                <td style={{ padding: '8px 0', fontWeight: '700', color: '#d97706', textAlign: 'right' }}>{booking.vgm_cutoff}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#374151', fontWeight: '600' }}>Gate-In Cut-Off:</td>
                <td style={{ padding: '8px 0', fontWeight: '700', color: '#2563eb', textAlign: 'right' }}>{booking.gatein_cutoff}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingTab;
