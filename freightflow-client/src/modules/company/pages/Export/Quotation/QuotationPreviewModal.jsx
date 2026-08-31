import React, { useState } from 'react';
import { X, Printer, Download, Ship, MapPin, Package, FileText, CheckCircle2, Building2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import Button from '../../../../../shared/components/Button';
import Badge from '../../../../../shared/components/Badge/Badge';

const QuotationPreviewModal = ({ quotation, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!quotation) return null;

  // Direct PDF Download handler using html2pdf.js
  const handleDownloadPDF = async () => {
    const sheetEl = document.getElementById('printable-quotation-sheet');
    if (!sheetEl) return;

    setIsExporting(true);

    try {
      const fileName = `Export_Quotation_${(quotation.quotation_no || 'Document').replace(/[\/\\]/g, '_')}.pdf`;
      const opt = {
        margin: [8, 8, 8, 8],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          windowWidth: 820
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(sheetEl).save();
    } catch (err) {
      console.error('Failed to export PDF:', err);
      handlePrint();
    } finally {
      setIsExporting(false);
    }
  };

  // Browser Print handler with clean page rules
  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Accepted': return 'success';
      case 'Sent': return 'info';
      case 'Prepared': return 'primary';
      case 'Draft': return 'warning';
      case 'Rejected':
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  };

  const activeCharges = Array.isArray(quotation.charges) 
    ? quotation.charges.filter(c => c.applicable && Number(c.amount) > 0)
    : [];

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          .printable-quotation-sheet, .printable-quotation-sheet * {
            visibility: visible !important;
          }
          .printable-quotation-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 12mm 15mm !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div 
        className="quotation-modal-backdrop no-print"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}
        onClick={onClose}
      >
        <div 
          className="quotation-modal-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Top Bar */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.35rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc', borderRadius: '10px 10px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} color="#1976D2" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: 600 }}>
                  Export Quotation Preview
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Ref: {quotation.quotation_no} | Inquiry: {quotation.inquiry_no || 'Direct'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button 
                variant="primary" 
                size="sm" 
                leftIcon={Download} 
                onClick={handleDownloadPDF}
                isLoading={isExporting}
                disabled={isExporting}
              >
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={Printer} 
                onClick={handlePrint}
                disabled={isExporting}
              >
                Print
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}><X size={18} /></Button>
            </div>
          </div>

          {/* Printable Quotation Sheet — Perfectly Balanced 1-Page A4 Printable Layout */}
          <div 
            id="printable-quotation-sheet" 
            className="printable-quotation-sheet" 
            style={{ 
              padding: '1.75rem 2rem', 
              backgroundColor: '#ffffff', 
              color: '#1f2937', 
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              minHeight: '265mm',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            
            <div>
              {/* Header / Branding */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1976D2', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <Building2 size={24} color="#1976D2" />
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1976D2', fontWeight: 800, letterSpacing: '-0.02em' }}>
                      FreightFlow Logistics ERP
                    </h1>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563', fontWeight: 500 }}>
                    Global Freight Forwarding & Export Logistics Operations
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', letterSpacing: '0.02em' }}>EXPORT QUOTATION</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1976D2', marginTop: '0.15rem' }}>{quotation.quotation_no}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.1rem' }}>
                    Date: {new Date(quotation.quotation_date || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} | Status: <strong>{quotation.status || 'Prepared'}</strong>
                  </div>
                </div>
              </div>

              {/* Exporter Details & Selected Carrier Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Exporter / Customer Details</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>{quotation.exporter_name || quotation.customer_name || 'N/A'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>
                    Linked Inquiry No: <strong>{quotation.inquiry_no || 'Direct Inquiry'}</strong>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Carrier & Commercial Terms</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Ship size={15} color="#0288d1" />
                    <span>{quotation.selected_carrier || quotation.shipping_line_preference || 'Selected Carrier'}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>
                    Incoterm: <strong>{quotation.shipment_terms || 'FOB'}</strong> | Destination Free Days: <strong>{quotation.free_days_required ? `${quotation.free_days_required} Days` : 'Standard'}</strong>
                  </div>
                </div>
              </div>

              {/* Shipment Routing & Cargo Specifications */}
              <div style={{ marginBottom: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1976D2', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.03em' }}>
                  Shipment Routing & Cargo Specifications
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '0.72rem', display: 'block' }}>Port of Loading (POL)</span>
                    <strong>{quotation.pol || quotation.origin || '-'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '0.72rem', display: 'block' }}>Port of Discharge (POD)</span>
                    <strong>{quotation.pod || quotation.destination || '-'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '0.72rem', display: 'block' }}>Commodity (HSN)</span>
                    <strong>{quotation.commodity || '-'}</strong> {quotation.hsn_code ? `(${quotation.hsn_code})` : ''}
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '0.72rem', display: 'block' }}>Containers</span>
                    <strong style={{ color: '#d97706' }}>{quotation.no_of_containers || '1'} x {quotation.container_type || "20'"}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '0.72rem', display: 'block' }}>Cargo Type & Weight</span>
                    <strong>{quotation.cargo_type || 'General'}</strong> {quotation.gross_weight ? `(${quotation.gross_weight})` : ''}
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '0.72rem', display: 'block' }}>Cargo Ready Date</span>
                    <strong>{quotation.cargo_ready_date ? new Date(quotation.cargo_ready_date).toLocaleDateString() : '-'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '0.72rem', display: 'block' }}>Stuffing Location</span>
                    <strong>{quotation.stuffing_location}</strong>
                  </div>
                  {quotation.fpod && (
                    <div>
                      <span style={{ color: '#6b7280', fontSize: '0.72rem', display: 'block' }}>Final Destination</span>
                      <strong>{quotation.fpod}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Charges Table */}
              <div style={{ marginBottom: '1rem', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Itemized Quotation Charges Breakdown</span>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 400 }}>Currency: INR (₹)</span>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', textAlign: 'left' }}>
                      <th style={{ padding: '0.35rem 0.5rem', borderBottom: '1.5px solid #cbd5e1', width: '35px', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '0.35rem 0.5rem', borderBottom: '1.5px solid #cbd5e1' }}>Charge / Service Description</th>
                      <th style={{ padding: '0.35rem 0.5rem', borderBottom: '1.5px solid #cbd5e1' }}>Basis</th>
                      <th style={{ padding: '0.35rem 0.5rem', borderBottom: '1.5px solid #cbd5e1', textAlign: 'center', width: '50px' }}>Qty</th>
                      <th style={{ padding: '0.35rem 0.5rem', borderBottom: '1.5px solid #cbd5e1', textAlign: 'right' }}>Rate (₹)</th>
                      <th style={{ padding: '0.35rem 0.5rem', borderBottom: '1.5px solid #cbd5e1', textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCharges.length > 0 ? (
                      activeCharges.map((charge, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', pageBreakInside: 'avoid' }}>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '0.3rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{charge.name}</td>
                          <td style={{ padding: '0.3rem 0.5rem', color: '#64748b', fontSize: '0.75rem' }}>{charge.basis}</td>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', fontWeight: 500 }}>{charge.quantity}</td>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right' }}>₹{Number(charge.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{Number(charge.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                          No applicable charges specified for this quotation.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}>
                      <td colSpan="5" style={{ padding: '0.45rem 0.6rem', textAlign: 'right', fontSize: '0.85rem' }}>GRAND TOTAL ESTIMATED FREIGHT & CHARGES:</td>
                      <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', fontSize: '1rem', color: '#0288d1' }}>
                        ₹{Number(quotation.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Customs & Carrier Summary Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.78rem', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} color="#16a34a" />
                    <span>Pre-Quotation Customs Verification</span>
                  </div>
                  <div>Customs Status: <strong>{quotation.customs_verification_status || 'Checked & Verified'}</strong></div>
                  <div>Cargo Photos: <strong>{quotation.customs_cargo_photos || 'Available'}</strong> | Restrictions: <strong>{quotation.customs_restrictions || 'None'}</strong></div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Carrier Evaluation Rationale</div>
                  <div>Selected Line: <strong>{quotation.selected_carrier || 'Primary Line'}</strong></div>
                  <div style={{ color: '#475569' }}>
                    {quotation.carrier_selection_notes || 'Selected for competitive rate & sector reliability'}
                  </div>
                </div>
              </div>

              {/* Remarks / Special Instructions */}
              {(quotation.special_requirements || quotation.remarks) && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '0.5rem 0.75rem', borderRadius: '5px', fontSize: '0.78rem', marginBottom: '0.75rem', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <strong style={{ color: '#b45309' }}>Special Notes & Instructions: </strong>
                  <span style={{ color: '#78350f' }}>
                    {quotation.special_requirements || quotation.remarks}
                  </span>
                </div>
              )}
            </div>

            {/* Formal Signature & Footer Block (Anchored via flex) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '0.65rem', marginTop: 'auto', fontSize: '0.72rem', color: '#64748b', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>Terms & Conditions:</p>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.68rem' }}>1. Freight rates subject to carrier space & equipment availability at POL.</p>
                <p style={{ margin: 0, fontSize: '0.68rem' }}>2. Storage & demurrage applicable beyond free days allowed.</p>
              </div>
              <div style={{ textAlign: 'right', minWidth: '200px' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>For FreightFlow Logistics ERP</p>
                <div style={{ height: '30px' }}></div>
                <p style={{ margin: 0, borderTop: '1px stroke #94a3b8', paddingTop: '0.2rem', fontWeight: 600, color: '#475569', fontSize: '0.72rem' }}>
                  Authorized Signatory
                </p>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="no-print" style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', borderRadius: '0 0 10px 10px' }}>
            <Button variant="primary" size="sm" onClick={onClose}>Close Preview</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuotationPreviewModal;
