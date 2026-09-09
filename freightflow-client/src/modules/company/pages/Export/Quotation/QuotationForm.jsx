import React, { useState, useEffect } from 'react';
import { X, Check, FileText, Building2, MapPin, Package, Box, Calendar, Ship, ShieldCheck, DollarSign, Calculator, ChevronDown, ChevronUp, AlertCircle, Plus, Trash2, RotateCcw } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import { businessService } from '../../../../masters/services/business.service';
import { logisticsService } from '../../../../masters/services/logistics.service';
import { commonService } from '../../../../masters/services/common.service';

export const generateQuotationNo = (existingCount = 0) => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const seq = String(existingCount + 1).padStart(3, '0');
  return `EQUOT/SS/${month}-${year}/${seq}`;
};

export const INITIAL_CHARGE_HEADS = [];

const DEFAULT_CARRIER_A = { line: 'Maersk Line', freight: 85000, local: 16000, notes: 'Direct weekly service, 14 days transit' };
const DEFAULT_CARRIER_B = { line: 'MSC Line', freight: 82000, local: 17500, notes: 'Transshipment via Colombo, 18 days transit' };
const DEFAULT_CARRIER_C = { line: 'CMA CGM', freight: 87000, local: 15500, notes: 'Direct service, strong local equipment' };

const DEFAULT_UOMS = [
  { id: 'uom_1', uom_code: 'KG', uom_name: 'Kilograms (KG)' },
  { id: 'uom_2', uom_code: 'MT', uom_name: 'Metric Tonnes (MT)' },
  { id: 'uom_3', uom_code: 'LBS', uom_name: 'Pounds (LBS)' },
  { id: 'uom_4', uom_code: 'CBM', uom_name: 'Cubic Meters (CBM)' },
  { id: 'uom_5', uom_code: 'PCS', uom_name: 'Pieces (PCS)' }
];

const parseWeightString = (str = '') => {
  if (!str) return { val: '', uom: 'KG' };
  const cleaned = String(str).trim();
  const match = cleaned.match(/^([\d.,]+)\s*([A-Za-z]+)?$/);
  if (match) {
    return {
      val: match[1] || '',
      uom: (match[2] || 'KG').toUpperCase()
    };
  }
  return { val: cleaned, uom: 'KG' };
};

const QuotationForm = ({ onCancel, onSuccess, initialData, existingCount = 0 }) => {
  const isEditMode = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Loaded Shipping Inquiries for Dropdown Linkage
  const [savedInquiries, setSavedInquiries] = useState([]);
  const [shippingLinesMaster, setShippingLinesMaster] = useState([]);
  const [uoms, setUoms] = useState(DEFAULT_UOMS);
  const [chargeMasters, setChargeMasters] = useState(INITIAL_CHARGE_HEADS);

  // Form State
  const [formData, setFormData] = useState({
    quotation_no: '',
    quotation_date: new Date().toISOString().split('T')[0],
    inquiry_id: '',
    inquiry_no: '',
    exporter_id: '',
    exporter_name: '',
    pol: '',
    pod: '',
    fpod: '',
    commodity: '',
    hsn_code: '',
    cargo_type: 'General',
    gross_weight: '',
    weight_value: '',
    weight_uom: 'KG',
    container_type: "20'",
    no_of_containers: '1',
    shipment_terms: 'FOB',
    cargo_ready_date: '',
    stuffing_location: 'Factory',
    stuffing_location_other: '',
    shipping_line_preference: '',
    free_days_required: '',
    special_requirements: '',
    
    // Customs Verification Checklist
    customs_verification_status: 'Checked & Verified',
    customs_commodity_checked: 'Yes',
    customs_cargo_photos: 'Available',
    customs_hsn_status: 'Verified',
    customs_restrictions: 'None',
    customs_notes: '',

    // Carrier Options
    carrier_option_a: DEFAULT_CARRIER_A,
    carrier_option_b: DEFAULT_CARRIER_B,
    carrier_option_c: DEFAULT_CARRIER_C,
    selected_carrier: 'Maersk Line',
    carrier_selection_notes: 'Selected Option A for optimal transit time & reliability on sector.',

    // Status
    status: 'Prepared',
    priority: 'Medium'
  });

  // Line Item Charges State (Loaded dynamically from Charge Master)
  const [charges, setCharges] = useState([]);

  // Calculate Total Quotation Amount
  const totalAmount = charges.reduce((sum, item) => {
    return item.applicable ? sum + (Number(item.amount) || 0) : sum;
  }, 0);

  // Fetch Saved Inquiries & Master Shipping Lines & UOMs
  useEffect(() => {
    try {
      const inqRaw = localStorage.getItem('freightflow_shipping_inquiries');
      if (inqRaw) {
        const parsed = JSON.parse(inqRaw);
        if (Array.isArray(parsed)) setSavedInquiries(parsed);
      }
    } catch (err) {
      console.error('Failed to load saved inquiries for dropdown:', err);
    }

    const fetchMasters = async () => {
      try {
        const [linesRes, uomRes, chargeRes] = await Promise.allSettled([
          logisticsService.getShippingLines(),
          commonService.getUOMs(),
          businessService.getCharges()
        ]);
        if (linesRes.status === 'fulfilled' && linesRes.value) {
          const data = linesRes.value?.data?.data?.data || linesRes.value?.data?.data || linesRes.value?.data;
          if (Array.isArray(data)) setShippingLinesMaster(data);
        }
        if (uomRes.status === 'fulfilled' && uomRes.value) {
          const data = uomRes.value?.data?.data?.data || uomRes.value?.data?.data || uomRes.value?.data;
          if (Array.isArray(data)) setUoms(data);
        }
        let chargeData = [];
        if (chargeRes.status === 'fulfilled' && chargeRes.value) {
          chargeData = chargeRes.value?.data?.data?.data || chargeRes.value?.data?.data || chargeRes.value?.data || [];
        }
        if (!Array.isArray(chargeData) || chargeData.length === 0) {
          try {
            const localRaw = localStorage.getItem('freightflow_charge_masters');
            if (localRaw) chargeData = JSON.parse(localRaw);
          } catch (lErr) {}
        }
        if (Array.isArray(chargeData) && chargeData.length > 0) {
          const activeMasters = chargeData.filter(c => c.status !== 'Inactive');
          const mappedMasters = activeMasters.map((c, i) => ({
            id: c.id || `cm_${i}`,
            name: c.charge_name || c.name || c.description,
            basis: c.basis || c.uom || 'Per Container',
            defaultApplicable: c.default_applicable ?? true,
            rate: Number(c.default_rate || c.rate || 0),
            quantity: Number(c.default_qty || c.quantity || 1)
          }));
          setChargeMasters(mappedMasters);

          if (!initialData) {
            setCharges(mappedMasters.map(cm => ({
              id: `ch_${cm.id}`,
              name: cm.name,
              basis: cm.basis,
              applicable: cm.defaultApplicable,
              quantity: cm.quantity,
              rate: cm.rate,
              amount: cm.defaultApplicable ? cm.quantity * cm.rate : 0
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch masters:', err);
      }
    };
    fetchMasters();
  }, []);

  // Initialize or Populate Form Data
  useEffect(() => {
    if (initialData) {
      const rawWeight = initialData.gross_weight || initialData.weight || '';
      const parsedWeight = parseWeightString(rawWeight);
      setFormData(prev => ({
        ...prev,
        ...initialData,
        gross_weight: rawWeight,
        weight_value: initialData.weight_value || parsedWeight.val,
        weight_uom: initialData.weight_uom || parsedWeight.uom,
        carrier_option_a: initialData.carrier_option_a || DEFAULT_CARRIER_A,
        carrier_option_b: initialData.carrier_option_b || DEFAULT_CARRIER_B,
        carrier_option_c: initialData.carrier_option_c || DEFAULT_CARRIER_C,
        quotation_date: initialData.quotation_date ? initialData.quotation_date.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      if (Array.isArray(initialData.charges)) {
        setCharges(initialData.charges);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        quotation_no: generateQuotationNo(existingCount)
      }));
    }
  }, [initialData, existingCount]);

  // Handle Inquiry Selection -> Auto Populate Shipment Fields & Quantities
  const handleInquirySelect = (e) => {
    const inqId = e.target.value;
    if (!inqId) return;

    const selectedInq = savedInquiries.find(item => String(item.id) === String(inqId) || item.inquiry_no === inqId);
    if (selectedInq) {
      const containerQty = parseInt(selectedInq.no_of_containers || selectedInq.quantity || '1', 10) || 1;
      const rawWeight = selectedInq.gross_weight || selectedInq.weight || '';
      const parsedWeight = parseWeightString(rawWeight);
      
      setFormData(prev => ({
        ...prev,
        inquiry_id: selectedInq.id,
        inquiry_no: selectedInq.inquiry_no,
        exporter_id: selectedInq.exporter_id || selectedInq.customer_id || '',
        exporter_name: selectedInq.exporter_name || selectedInq.customer_name || '',
        pol: selectedInq.pol || selectedInq.origin || '',
        pod: selectedInq.pod || selectedInq.destination || '',
        fpod: selectedInq.fpod || '',
        commodity: selectedInq.commodity || '',
        hsn_code: selectedInq.hsn_code || '',
        cargo_type: selectedInq.cargo_type || 'General',
        gross_weight: rawWeight,
        weight_value: parsedWeight.val,
        weight_uom: parsedWeight.uom,
        container_type: selectedInq.container_type || "20'",
        no_of_containers: String(containerQty),
        shipment_terms: selectedInq.shipment_terms || 'FOB',
        cargo_ready_date: selectedInq.cargo_ready_date ? selectedInq.cargo_ready_date.split('T')[0] : '',
        stuffing_location: selectedInq.stuffing_location || 'Factory',
        stuffing_location_other: selectedInq.stuffing_location_other || '',
        factory_details: selectedInq.factory_details || null,
        factory_name: selectedInq.factory_name || selectedInq.factory_details?.factory_name || '',
        factory_address: selectedInq.factory_address || selectedInq.factory_details?.factory_address || '',
        factory_city: selectedInq.factory_city || selectedInq.factory_details?.city || '',
        factory_state: selectedInq.factory_state || selectedInq.factory_details?.state || '',
        factory_pincode: selectedInq.factory_pincode || selectedInq.factory_details?.pincode || '',
        factory_contact_person: selectedInq.factory_contact_person || selectedInq.factory_details?.contact_person || '',
        factory_contact_phone: selectedInq.factory_contact_phone || selectedInq.factory_details?.contact_phone || '',
        factory_gstin: selectedInq.factory_gstin || selectedInq.factory_details?.gstin || '',
        shipping_line_preference: selectedInq.shipping_line_preference || '',
        free_days_required: selectedInq.free_days_required !== undefined ? String(selectedInq.free_days_required) : '',
        special_requirements: selectedInq.special_requirements || selectedInq.remarks || ''
      }));

      // Update charges quantities for 'Per Container' basis to match inquiry's container count
      setCharges(prevCharges => 
        prevCharges.map(item => {
          const newQty = item.basis === 'Per Container' ? containerQty : item.quantity;
          const newAmt = item.applicable ? newQty * (Number(item.rate) || 0) : 0;
          return {
            ...item,
            quantity: newQty,
            amount: newAmt
          };
        })
      );
    }
  };

  // Input Field Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Carrier Option Field Change Handler
  const handleCarrierOptionChange = (optionKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [optionKey]: {
        ...(prev[optionKey] || {}),
        [field]: value
      }
    }));
  };

  // Select Option Action Handler
  const handleSelectCarrierOption = (optionObj) => {
    if (!optionObj) return;
    setFormData(prev => ({
      ...prev,
      selected_carrier: optionObj.line || '',
      carrier_selection_notes: `Selected ${optionObj.line || 'Carrier'} (Freight Rate: ₹${optionObj.freight || 0}). ${optionObj.notes || ''}`
    }));

    // Update Ocean Freight charge line rate automatically
    setCharges(prevCharges => 
      prevCharges.map(item => {
        if (item.id === 'ch1' || item.name.includes('Ocean Freight')) {
          const newRate = Number(optionObj.freight) || item.rate;
          return {
            ...item,
            applicable: true,
            rate: newRate,
            amount: item.quantity * newRate
          };
        }
        return item;
      })
    );
  };

  // Charge Line Item Handlers
  const handleChargeToggle = (id) => {
    setCharges(prev => prev.map(c => {
      if (c.id === id) {
        const nextApplicable = !c.applicable;
        return {
          ...c,
          applicable: nextApplicable,
          amount: nextApplicable ? (Number(c.quantity) || 1) * (Number(c.rate) || 0) : 0
        };
      }
      return c;
    }));
  };

  const handleChargeValueChange = (id, field, val) => {
    setCharges(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: val };
        
        if (field === 'name' || field === 'basis') {
          return updated;
        }

        const q = field === 'quantity' ? (Number(val) || 0) : (Number(c.quantity) || 0);
        const r = field === 'rate' ? (Number(val) || 0) : (Number(c.rate) || 0);
        
        if (field === 'amount') {
          updated.amount = Number(val) || 0;
        } else {
          updated.quantity = q;
          updated.rate = r;
          updated.amount = c.applicable ? q * r : 0;
        }

        return updated;
      }
      return c;
    }));
  };

  const handleAddChargeLine = (presetCharge = null) => {
    const newId = `ch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setCharges(prev => [
      ...prev,
      {
        id: newId,
        name: presetCharge?.name || presetCharge?.charge_name || '',
        basis: presetCharge?.basis || presetCharge?.uom || 'Per Container',
        applicable: true,
        quantity: 1,
        rate: Number(presetCharge?.rate || presetCharge?.default_rate || 0),
        amount: Number(presetCharge?.rate || presetCharge?.default_rate || 0)
      }
    ]);
  };

  const handleRemoveChargeLine = (id) => {
    setCharges(prev => prev.filter(c => c.id !== id));
  };

  const handleResetToMasterCharges = () => {
    setCharges(
      chargeMasters.map(ch => ({
        id: `ch_${ch.id}`,
        name: ch.name,
        basis: ch.basis,
        applicable: ch.defaultApplicable,
        quantity: ch.quantity || 1,
        rate: ch.rate || 0,
        amount: ch.defaultApplicable ? (ch.quantity || 1) * (ch.rate || 0) : 0
      }))
    );
  };

  // Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setGlobalError('');

    if (!formData.exporter_name && !formData.exporter_id) {
      setGlobalError('Please select or specify an Exporter / Customer.');
      return;
    }

    const finalWeight = formData.weight_value 
      ? `${formData.weight_value} ${formData.weight_uom || 'KG'}`.trim()
      : formData.gross_weight;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        gross_weight: finalWeight,
        charges,
        total_amount: totalAmount,
        id: isEditMode ? initialData.id : `quot_${Date.now()}`,
        created_at: isEditMode ? initialData.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onSuccess && onSuccess(payload);
    } catch (err) {
      setGlobalError(err.message || 'Failed to save export quotation.');
    } finally {
      setIsLoading(false);
    }
  };

  const sectionHeaderStyle = {
    fontSize: '0.875rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--primary, #1976D2)',
    borderBottom: '2px solid #e3f2fd',
    paddingBottom: '0.4rem',
    marginBottom: '0.85rem',
    marginTop: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const carrierA = formData.carrier_option_a || DEFAULT_CARRIER_A;
  const carrierB = formData.carrier_option_b || DEFAULT_CARRIER_B;
  const carrierC = formData.carrier_option_c || DEFAULT_CARRIER_C;

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
      <div className="flex justify-between align-center mb-md border-b-light pb-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
        <div>
          <h2 className="text-lg font-semibold m-0" style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: 600 }}>
            {isEditMode ? `Edit Export Quotation (${formData.quotation_no})` : 'New Export Quotation'}
          </h2>
          <p className="text-xs text-tertiary m-0 mt-xs" style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Link Shipping Inquiry, perform customs verification, evaluate carrier freight options, and calculate quotation charges.
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && (
        <div className="alert alert-danger mb-md p-sm text-sm" style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.75rem 1rem', borderRadius: '6px', borderLeft: '4px solid #ef5350', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* SECTION 1 — HEADER & LINKED SHIPPING INQUIRY */}
        <div style={sectionHeaderStyle}>
          <FileText size={16} color="#1976D2" />
          <span>Section 1 — Header & Linked Shipping Inquiry</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          {/* Quotation No */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Quotation No <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="text"
              name="quotation_no"
              value={formData.quotation_no}
              readOnly
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontWeight: 700, color: '#1976D2' }}
            />
            <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>System Generated (Format: EQUOT/SS/MM-YY/001)</small>
          </div>

          {/* Quotation Date */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Quotation Date <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="date"
              name="quotation_date"
              value={formData.quotation_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            />
          </div>

          {/* Linked Shipping Inquiry Selector */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0288d1', marginBottom: '0.35rem' }}>
              Link Existing Shipping Inquiry <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <select
              name="inquiry_id"
              value={formData.inquiry_id || formData.inquiry_no}
              onChange={handleInquirySelect}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '2px solid #0288d1', backgroundColor: '#f0f9ff' }}
            >
              <option value="">-- Select Inquiry No to Auto-Populate --</option>
              {savedInquiries.map(inq => (
                <option key={inq.id} value={inq.id}>
                  {inq.inquiry_no} — {inq.exporter_name || inq.customer_name} ({inq.pol || inq.origin} → {inq.pod || inq.destination})
                </option>
              ))}
            </select>
            <small style={{ fontSize: '0.75rem', color: '#0288d1' }}>Selecting an Inquiry copies POL, POD, Commodity, HSN, & Containers</small>
          </div>

          {/* Exporter Name */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Exporter / Customer <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="text"
              name="exporter_name"
              value={formData.exporter_name}
              onChange={handleChange}
              placeholder="Exporter Name"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            />
          </div>

        </div>

        {/* SECTION 2 — SHIPMENT SUMMARY (AUTO-FILLED FROM INQUIRY) */}
        <div style={sectionHeaderStyle}>
          <MapPin size={16} color="#1976D2" />
          <span>Section 2 — Shipment Routing & Cargo Specifications</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* POL */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Port of Loading (POL) <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="pol"
              value={formData.pol}
              onChange={handleChange}
              placeholder="e.g. Mundra Port (INMUN)"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* POD */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Port of Discharge (POD) <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="pod"
              value={formData.pod}
              onChange={handleChange}
              placeholder="e.g. Dubai / Jebel Ali (AEJEA)"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* FPOD */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Final Place of Delivery (FPOD) <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="fpod"
              value={formData.fpod}
              onChange={handleChange}
              placeholder="e.g. Destination ICD / Warehouse"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Commodity */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Commodity <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="commodity"
              value={formData.commodity}
              onChange={handleChange}
              placeholder="e.g. Cotton Textiles"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* HSN Code */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>HSN Code <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="hsn_code"
              value={formData.hsn_code}
              onChange={handleChange}
              placeholder="e.g. 5205.12"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Container Type */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Container Requirement <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="container_type"
              value={formData.container_type}
              onChange={handleChange}
              placeholder="e.g. 40' HC"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* No of Containers */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>No. of Containers <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="number"
              min="1"
              name="no_of_containers"
              value={formData.no_of_containers}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Gross Weight with UOM Master Dropdown */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Gross Weight <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                name="weight_value"
                value={formData.weight_value || ''}
                onChange={handleChange}
                placeholder="e.g. 24000"
                style={{ width: '60%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
              <select
                name="weight_uom"
                value={formData.weight_uom || 'KG'}
                onChange={handleChange}
                style={{ width: '40%', padding: '0.45rem 0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontWeight: 600, backgroundColor: '#f8fafc' }}
              >
                {uoms.map(u => {
                  const code = u.uom_code || u.code || u.uom_name || u.name || 'KG';
                  const label = u.uom_name || u.name || code;
                  return (
                    <option key={u.id || code} value={code}>
                      {code} ({label})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Shipment Terms */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Shipment Terms <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <select
              name="shipment_terms"
              value={formData.shipment_terms}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="FOB">FOB — Free On Board</option>
              <option value="CIF">CIF — Cost, Insurance & Freight</option>
              <option value="CFR">CFR — Cost & Freight</option>
              <option value="EXW">EXW — Ex Works</option>
            </select>
          </div>
        </div>

        {/* SECTION 3 — PRE-QUOTATION CUSTOMS VERIFICATION CHECKLIST */}
        <div style={sectionHeaderStyle}>
          <ShieldCheck size={16} color="#1976D2" />
          <span>Section 3 — Pre-Quotation Customs & Restriction Verification</span>
        </div>
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            {/* Customs Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Customs Check Status</label>
              <select
                name="customs_verification_status"
                value={formData.customs_verification_status}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Checked & Verified">Checked & Verified</option>
                <option value="Pending Check">Pending Check</option>
              </select>
            </div>

            {/* Commodity Verification */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Commodity Verification</label>
              <select
                name="customs_commodity_checked"
                value={formData.customs_commodity_checked}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Yes">Verified (Matches Description)</option>
                <option value="No">Pending Inspection</option>
              </select>
            </div>

            {/* Cargo Photos */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Cargo Photos Check</label>
              <select
                name="customs_cargo_photos"
                value={formData.customs_cargo_photos}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Available">Available & Verified</option>
                <option value="Not Available">Not Available</option>
                <option value="Pending">Requested from Exporter</option>
              </select>
            </div>

            {/* HSN Verification */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>HSN Code Check</label>
              <select
                name="customs_hsn_status"
                value={formData.customs_hsn_status}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Verified">Verified on ICEGATE</option>
                <option value="Requires Clarification">Requires Clarification</option>
              </select>
            </div>

            {/* ICEGATE / DGFT Restriction */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>DGFT / ICEGATE Restrictions</label>
              <select
                name="customs_restrictions"
                value={formData.customs_restrictions}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="None">None (Free Export)</option>
                <option value="Restricted / License Required">Restricted / Export License Req.</option>
                <option value="Special Clearance Needed">Special Approval / Test Cert Req.</option>
              </select>
            </div>

          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Customs Verification Notes</label>
            <input
              type="text"
              name="customs_notes"
              value={formData.customs_notes}
              onChange={handleChange}
              placeholder="e.g. Checked ICEGATE portal for RODTEP eligibility & DGFT notification restrictions..."
              style={{ width: '100%', padding: '0.4rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* SECTION 4 — FREIGHT & CARRIER COMPARISON ENGINE */}
        <div style={sectionHeaderStyle}>
          <Ship size={16} color="#1976D2" />
          <span>Section 4 — Shipping Line Freight Rates & Carrier Comparison</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          
          {/* OPTION A */}
          <div style={{ border: formData.selected_carrier === carrierA.line ? '2px solid #0288d1' : '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: formData.selected_carrier === carrierA.line ? '#f0f9ff' : '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0288d1' }}>Carrier Option A</strong>
              <Button type="button" variant={formData.selected_carrier === carrierA.line ? "primary" : "outline"} size="sm" onClick={() => handleSelectCarrierOption(carrierA)}>
                {formData.selected_carrier === carrierA.line ? "Selected" : "Select Option A"}
              </Button>
            </div>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Shipping Line (e.g. Maersk)"
                value={carrierA.line}
                onChange={(e) => handleCarrierOptionChange('carrier_option_a', 'line', e.target.value)}
                style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="number"
                  placeholder="Freight (₹)"
                  value={carrierA.freight}
                  onChange={(e) => handleCarrierOptionChange('carrier_option_a', 'freight', Number(e.target.value))}
                  style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <input
                  type="number"
                  placeholder="Local (₹)"
                  value={carrierA.local}
                  onChange={(e) => handleCarrierOptionChange('carrier_option_a', 'local', Number(e.target.value))}
                  style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <input
                type="text"
                placeholder="Transit time & Sector notes"
                value={carrierA.notes}
                onChange={(e) => handleCarrierOptionChange('carrier_option_a', 'notes', e.target.value)}
                style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
              />
            </div>
          </div>

          {/* OPTION B */}
          <div style={{ border: formData.selected_carrier === carrierB.line ? '2px solid #0288d1' : '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: formData.selected_carrier === carrierB.line ? '#f0f9ff' : '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0288d1' }}>Carrier Option B</strong>
              <Button type="button" variant={formData.selected_carrier === carrierB.line ? "primary" : "outline"} size="sm" onClick={() => handleSelectCarrierOption(carrierB)}>
                {formData.selected_carrier === carrierB.line ? "Selected" : "Select Option B"}
              </Button>
            </div>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Shipping Line (e.g. MSC)"
                value={carrierB.line}
                onChange={(e) => handleCarrierOptionChange('carrier_option_b', 'line', e.target.value)}
                style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="number"
                  placeholder="Freight (₹)"
                  value={carrierB.freight}
                  onChange={(e) => handleCarrierOptionChange('carrier_option_b', 'freight', Number(e.target.value))}
                  style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <input
                  type="number"
                  placeholder="Local (₹)"
                  value={carrierB.local}
                  onChange={(e) => handleCarrierOptionChange('carrier_option_b', 'local', Number(e.target.value))}
                  style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <input
                type="text"
                placeholder="Transit time & Sector notes"
                value={carrierB.notes}
                onChange={(e) => handleCarrierOptionChange('carrier_option_b', 'notes', e.target.value)}
                style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
              />
            </div>
          </div>

          {/* OPTION C */}
          <div style={{ border: formData.selected_carrier === carrierC.line ? '2px solid #0288d1' : '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: formData.selected_carrier === carrierC.line ? '#f0f9ff' : '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0288d1' }}>Carrier Option C</strong>
              <Button type="button" variant={formData.selected_carrier === carrierC.line ? "primary" : "outline"} size="sm" onClick={() => handleSelectCarrierOption(carrierC)}>
                {formData.selected_carrier === carrierC.line ? "Selected" : "Select Option C"}
              </Button>
            </div>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Shipping Line (e.g. CMA CGM)"
                value={carrierC.line}
                onChange={(e) => handleCarrierOptionChange('carrier_option_c', 'line', e.target.value)}
                style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="number"
                  placeholder="Freight (₹)"
                  value={carrierC.freight}
                  onChange={(e) => handleCarrierOptionChange('carrier_option_c', 'freight', Number(e.target.value))}
                  style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <input
                  type="number"
                  placeholder="Local (₹)"
                  value={carrierC.local}
                  onChange={(e) => handleCarrierOptionChange('carrier_option_c', 'local', Number(e.target.value))}
                  style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <input
                type="text"
                placeholder="Transit time & Sector notes"
                value={carrierC.notes}
                onChange={(e) => handleCarrierOptionChange('carrier_option_c', 'notes', e.target.value)}
                style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
              />
            </div>
          </div>

        </div>

        {/* Selected Carrier Rationale */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Selected Shipping Line / Carrier</label>
            <input
              type="text"
              name="selected_carrier"
              value={formData.selected_carrier}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db', fontWeight: 700, color: '#0288d1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Carrier Selection Rationale</label>
            <input
              type="text"
              name="carrier_selection_notes"
              value={formData.carrier_selection_notes}
              onChange={handleChange}
              placeholder="Explain commercial & operational reasons for selecting carrier..."
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
        </div>

        {/* SECTION 5 — CLIENT QUOTATION CHARGE LINE ITEMS (CHARGES ENGINE) */}
        <div style={sectionHeaderStyle}>
          <Calculator size={16} color="#1976D2" />
          <span>Section 5 — Client Quotation Charge Line Items (Charge Master Engine)</span>
        </div>

        {/* Master Quick Select Bar & Reset Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Quick Add From Charge Master:</span>
            <select
              style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#f8fafc' }}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const found = chargeMasters.find(cm => String(cm.id) === String(val) || cm.name === val);
                if (found) {
                  handleAddChargeLine(found);
                }
                e.target.value = '';
              }}
            >
              <option value="">-- Pick Charge Head to Add --</option>
              {chargeMasters.map((cm, i) => (
                <option key={cm.id || i} value={cm.id || cm.name}>
                  {cm.name} ({cm.basis}) - ₹{cm.rate}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToMasterCharges}
            leftIcon={RotateCcw}
            style={{ fontSize: '0.78rem' }}
          >
            Reset Default Charges
          </Button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem', textAlign: 'center', width: '50px' }}>Apply</th>
                <th style={{ padding: '0.6rem', width: '35%' }}>Charge / Service Description</th>
                <th style={{ padding: '0.6rem', width: '20%' }}>Basis / Unit</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', width: '10%' }}>Quantity</th>
                <th style={{ padding: '0.6rem', textAlign: 'right', width: '14%' }}>Rate (₹)</th>
                <th style={{ padding: '0.6rem', textAlign: 'right', width: '14%' }}>Amount (₹)</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', width: '50px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: item.applicable ? '#ffffff' : '#f8fafc' }}>
                  
                  {/* Applicable Checkbox */}
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={item.applicable}
                      onChange={() => handleChargeToggle(item.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>

                  {/* Charge Name (Editable Input) */}
                  <td style={{ padding: '0.4rem' }}>
                    <input
                      type="text"
                      disabled={!item.applicable}
                      value={item.name || ''}
                      onChange={(e) => handleChargeValueChange(item.id, 'name', e.target.value)}
                      placeholder="e.g. Ocean Freight / THC / BL Charges"
                      style={{
                        width: '100%',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem',
                        fontWeight: item.applicable ? 600 : 400,
                        color: item.applicable ? '#0f172a' : '#94a3b8',
                        backgroundColor: item.applicable ? '#ffffff' : '#f1f5f9'
                      }}
                    />
                  </td>

                  {/* Basis / Unit (Editable Select) */}
                  <td style={{ padding: '0.4rem' }}>
                    <select
                      disabled={!item.applicable}
                      value={item.basis || 'Per Container'}
                      onChange={(e) => handleChargeValueChange(item.id, 'basis', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        color: item.applicable ? '#334155' : '#94a3b8',
                        backgroundColor: item.applicable ? '#ffffff' : '#f1f5f9'
                      }}
                    >
                      <option value="Per Container">Per Container</option>
                      <option value="Per BL Set">Per BL Set</option>
                      <option value="Flat / Lump sum">Flat / Lump sum</option>
                      <option value="Per Vehicle">Per Vehicle</option>
                      <option value="Per Set">Per Set</option>
                      <option value="Per CBM">Per CBM</option>
                      <option value="Per MT">Per MT</option>
                      <option value="Per KG">Per KG</option>
                      <option value="Per Document">Per Document</option>
                      <option value="Per Day">Per Day</option>
                    </select>
                  </td>

                  {/* Quantity Input */}
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      disabled={!item.applicable}
                      value={item.quantity}
                      onChange={(e) => handleChargeValueChange(item.id, 'quantity', e.target.value)}
                      style={{
                        width: '65px',
                        padding: '0.3rem 0.25rem',
                        textAlign: 'center',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem'
                      }}
                    />
                  </td>

                  {/* Rate Input */}
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>
                    <input
                      type="number"
                      min="0"
                      disabled={!item.applicable}
                      value={item.rate}
                      onChange={(e) => handleChargeValueChange(item.id, 'rate', e.target.value)}
                      style={{
                        width: '90px',
                        padding: '0.3rem 0.4rem',
                        textAlign: 'right',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem'
                      }}
                    />
                  </td>

                  {/* Amount Input */}
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>
                    <input
                      type="number"
                      min="0"
                      disabled={!item.applicable}
                      value={item.amount}
                      onChange={(e) => handleChargeValueChange(item.id, 'amount', e.target.value)}
                      style={{
                        width: '105px',
                        padding: '0.3rem 0.4rem',
                        textAlign: 'right',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: item.applicable ? '#2e7d32' : '#94a3b8'
                      }}
                    />
                  </td>

                  {/* Remove Button */}
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveChargeLine(item.id)}
                      title="Remove Charge Line"
                      style={{
                        border: 'none',
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '0.35rem 0.45rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}>
                <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.95rem' }}>
                  GRAND TOTAL ESTIMATED CHARGES:
                </td>
                <td colSpan="2" style={{ padding: '0.75rem', textAlign: 'right', fontSize: '1.2rem', color: '#0288d1' }}>
                  ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Action Bar for Adding New Custom Lines */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.75rem', marginBottom: '1.5rem' }}>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleAddChargeLine()}
            leftIcon={Plus}
            style={{ fontSize: '0.825rem' }}
          >
            Add Custom Charge Line
          </Button>
        </div>

        {/* SECTION 6 — STATUS & REMARKS */}
        <div style={sectionHeaderStyle}>
          <FileText size={16} color="#1976D2" />
          <span>Section 6 — Lifecycle Status & Instructions</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          
          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Quotation Lifecycle Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="Draft">Draft</option>
              <option value="Prepared">Prepared / Ready</option>
              <option value="Sent">Sent to Exporter</option>
              <option value="Accepted">Accepted (Ready for Booking)</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

        </div>

        {/* Special Instructions */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Special Quotation Notes / Instructions</label>
          <textarea
            name="special_requirements"
            rows="3"
            value={formData.special_requirements}
            onChange={handleChange}
            placeholder="Add special terms, validity dates, equipment conditions..."
            style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db', resize: 'vertical' }}
          />
        </div>

        {/* Actions */}
        <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading} leftIcon={Check}>
            {isEditMode ? 'Update Export Quotation' : 'Save Export Quotation'}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default QuotationForm;
