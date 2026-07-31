import React, { useState } from 'react';
import { FileText, Printer, Download, CheckCircle2 } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import Badge from '../../../../../shared/components/Badge';
import { toast } from 'react-toastify';

const BLTab = ({ shipmentId, jobId }) => {
  const [blType, setBlType] = useState('HBL');
  const [blData, setBlData] = useState({
    hbl_number: 'HBL-202607-0041',
    mbl_number: 'MBL-MAEU-991204',
    shipper: 'Godrej Consumer Products Ltd, Mumbai, India',
    consignee: 'Global Logistics Trading FZE, Dubai, UAE',
    notify_party: 'Same as Consignee',
    ocean_vessel: 'MSC ISABELLA V.2026E',
    port_of_loading: 'Nhava Sheva (INNSA), India',
    port_of_discharge: 'Jebel Ali Port (AEJEA), UAE',
    place_of_delivery: 'Dubai Free Zone, UAE',
    freight_term: 'PREPAID',
    packages: '450 CARTONS',
    gross_weight: '24,500.00 KGS',
    measurement: '67.500 CBM',
    status: 'ISSUED'
  });

  const handlePrint = () => {
    toast.success(`Printing ${blType} ${blType === 'HBL' ? blData.hbl_number : blData.mbl_number}...`);
    window.print();
  };

  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '3px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setBlType('HBL')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: blType === 'HBL' ? '#dc2626' : 'transparent',
                color: blType === 'HBL' ? '#ffffff' : '#4b5563'
              }}
            >
              House BL (HBL)
            </button>
            <button
              onClick={() => setBlType('MBL')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: blType === 'MBL' ? '#dc2626' : 'transparent',
                color: blType === 'MBL' ? '#ffffff' : '#4b5563'
              }}
            >
              Master BL (MBL)
            </button>
          </div>
          <Badge variant="success">STATUS: {blData.status}</Badge>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" leftIcon={Printer} onClick={handlePrint}>Print {blType}</Button>
          <Button variant="primary" size="sm" leftIcon={Download} onClick={() => toast.success(`Downloaded ${blType} PDF`)}>Download PDF</Button>
        </div>
      </div>

      {/* PRINTABLE BILL OF LADING DOCUMENT PREVIEW */}
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          border: '2px solid #111827', 
          borderRadius: '8px', 
          padding: '24px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {/* BL DOCUMENT HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111827', pb: '12px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#dc2626', letterSpacing: '1px' }}>
              FREIGHTFLOW LOGISTICS CORP.
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#4b5563' }}>
              BILL OF LADING FOR OCEAN FREIGHT OR MULTIMODAL TRANSPORT
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase' }}>{blType} NUMBER</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#111827' }}>
              {blType === 'HBL' ? blData.hbl_number : blData.mbl_number}
            </h3>
          </div>
        </div>

        {/* SHIPPER & CONSIGNEE GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #111827', marginBottom: '16px' }}>
          <div style={{ padding: '10px', borderRight: '1px solid #111827', borderBottom: '1px solid #111827' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>SHIPPER / EXPORTER</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '600', color: '#111827' }}>{blData.shipper}</p>
          </div>
          <div style={{ padding: '10px', borderBottom: '1px solid #111827' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>CONSIGNEE</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '600', color: '#111827' }}>{blData.consignee}</p>
          </div>
          <div style={{ padding: '10px', borderRight: '1px solid #111827' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>NOTIFY PARTY</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '600', color: '#111827' }}>{blData.notify_party}</p>
          </div>
          <div style={{ padding: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>FREIGHT TERMS</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>{blData.freight_term}</p>
          </div>
        </div>

        {/* ROUTE & CARGO TABLE */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #111827', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #111827' }}>
              <th style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #111827' }}>VESSEL & VOYAGE</th>
              <th style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #111827' }}>PORT OF LOADING</th>
              <th style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #111827' }}>PORT OF DISCHARGE</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>FINAL DESTINATION</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #111827' }}>
              <td style={{ padding: '8px', fontWeight: '700', borderRight: '1px solid #111827' }}>{blData.ocean_vessel}</td>
              <td style={{ padding: '8px', borderRight: '1px solid #111827' }}>{blData.port_of_loading}</td>
              <td style={{ padding: '8px', borderRight: '1px solid #111827' }}>{blData.port_of_discharge}</td>
              <td style={{ padding: '8px' }}>{blData.place_of_delivery}</td>
            </tr>
          </tbody>
        </table>

        {/* CARGO SUMMARY */}
        <div style={{ marginTop: '16px', border: '1px solid #111827', padding: '12px', backgroundColor: '#fafafa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: '700' }}>TOTAL PACKAGES</span>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '700' }}>{blData.packages}</h4>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: '700' }}>GROSS WEIGHT</span>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '700' }}>{blData.gross_weight}</h4>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: '700' }}>MEASUREMENT</span>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '700' }}>{blData.measurement}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BLTab;
