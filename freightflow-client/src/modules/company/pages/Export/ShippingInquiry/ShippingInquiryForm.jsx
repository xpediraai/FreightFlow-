import React, { useState, useEffect } from 'react';
import { X, Check, Building2, MapPin, Package, Box, FileText, Calendar, Ship, AlertCircle } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import { businessService } from '../../../../masters/services/business.service';
import { foundationService } from '../../../../masters/services/foundation.service';
import { logisticsService } from '../../../../masters/services/logistics.service';
import { commonService } from '../../../../masters/services/common.service';

export const generateInquiryNo = (existingCount = 0) => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const seq = String(existingCount + 1).padStart(3, '0');
  return `ESI/SS/${month}-${year}/${seq}`;
};

const DEFAULT_EXPORTERS = [
  { id: 'c1', customer_name: 'Apex Global Logistics Ltd' },
  { id: 'c2', customer_name: 'Sunlight Exports & Trading' },
  { id: 'c3', customer_name: 'Gujarat Textiles Pvt Ltd' },
  { id: 'c4', customer_name: 'Orient Shipping & Freight Corp' },
];

const DEFAULT_PORTS = [
  { id: 'p1', port_name: 'Mundra Port (INMUN)', port_code: 'INMUN' },
  { id: 'p2', port_name: 'Nhava Sheva / JNPT (INNSA)', port_code: 'INNSA' },
  { id: 'p3', port_name: 'Hazira Port (INHZR)', port_code: 'INHZR' },
  { id: 'p4', port_name: 'Kandla Port (IXY)', port_code: 'IXY' },
  { id: 'p5', port_name: 'Dubai / Jebel Ali (AEJEA)', port_code: 'AEJEA' },
  { id: 'p6', port_name: 'Rotterdam (NLRTM)', port_code: 'NLRTM' },
  { id: 'p7', port_name: 'Singapore (SGSIN)', port_code: 'SGSIN' },
  { id: 'p8', port_name: 'Hamburg (DEHAM)', port_code: 'DEHAM' },
  { id: 'p9', port_name: 'New York / New Jersey (USNYC)', port_code: 'USNYC' },
  { id: 'p10', port_name: 'Shanghai (CNSHA)', port_code: 'CNSHA' }
];

const DEFAULT_SHIPPING_LINES = [
  { id: 'sl1', name: 'Maersk Line' },
  { id: 'sl2', name: 'MSC (Mediterranean Shipping Company)' },
  { id: 'sl3', name: 'CMA CGM' },
  { id: 'sl4', name: 'Hapag-Lloyd' },
  { id: 'sl5', name: 'ONE (Ocean Network Express)' },
  { id: 'sl6', name: 'COSCO Shipping' }
];

const DEFAULT_CONTAINER_TYPES = [
  { id: 'ct1', container_code: "20'", container_name: "20' Standard Dry (20GP)" },
  { id: 'ct2', container_code: "40'", container_name: "40' Standard Dry (40GP)" },
  { id: 'ct3', container_code: "40' HC", container_name: "40' High Cube (40HC)" },
  { id: 'ct4', container_code: "20' RF", container_name: "20' Reefer Container" },
  { id: 'ct5', container_code: "40' RF", container_name: "40' Reefer Container" },
  { id: 'ct6', container_code: "20' OT", container_name: "20' Open Top" },
  { id: 'ct7', container_code: "40' FR", container_name: "40' Flat Rack" }
];

const DEFAULT_UOMS = [
  { id: 'uom_1', uom_code: 'KG', uom_name: 'Kilograms (KG)' },
  { id: 'uom_2', uom_code: 'MT', uom_name: 'Metric Tonnes (MT)' },
  { id: 'uom_3', uom_code: 'LBS', uom_name: 'Pounds (LBS)' },
  { id: 'uom_4', uom_code: 'CBM', uom_name: 'Cubic Meters (CBM)' },
  { id: 'uom_5', uom_code: 'PCS', uom_name: 'Pieces (PCS)' }
];

export const parseWeightString = (str = '') => {
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

const ShippingInquiryForm = ({ onCancel, onSuccess, initialData, existingCount = 0 }) => {
  const isEditMode = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownsLoading, setIsDropdownsLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  // Live Master Dropdown States
  const [exporters, setExporters] = useState(DEFAULT_EXPORTERS);
  const [ports, setPorts] = useState(DEFAULT_PORTS);
  const [shippingLines, setShippingLines] = useState(DEFAULT_SHIPPING_LINES);
  const [containerTypes, setContainerTypes] = useState(DEFAULT_CONTAINER_TYPES);
  const [uoms, setUoms] = useState(DEFAULT_UOMS);

  const [formData, setFormData] = useState({
    inquiry_no: '',
    exporter_id: '',
    exporter_name: '',
    pol: '',
    pod: '',
    fpod: '',
    commodity: '',
    hsn_code: '',
    cargo_type: 'General', // General | Hazardous | Reefer | OOG
    gross_weight: '',
    weight_value: '',
    weight_uom: 'KG',
    container_type: "20'", // 20' | 40' | 40' HC | Master Types
    no_of_containers: '1',
    shipment_terms: 'FOB', // FOB | CIF | CFR | EXW
    cargo_ready_date: '',
    stuffing_location: 'Factory', // Factory | CFS | Other
    stuffing_location_other: '',
    shipping_line_preference: '',
    free_days_required: '',
    special_requirements: '',
    priority: 'Medium',
    status: 'Pending'
  });

  // Fetch Master Data on Mount
  useEffect(() => {
    const fetchLiveMasterDropdowns = async () => {
      setIsDropdownsLoading(true);
      try {
        const [custRes, portRes, shipLineRes, containerTypeRes, uomRes] = await Promise.allSettled([
          businessService.getCustomers(),
          logisticsService.getPorts(),
          logisticsService.getShippingLines(),
          commonService.getContainerTypes(),
          commonService.getUOMs()
        ]);

        const extractData = (res) => {
          if (res.status === 'fulfilled' && res.value) {
            const data = res.value?.data?.data?.data || res.value?.data?.data || res.value?.data;
            if (Array.isArray(data)) return data;
          }
          return [];
        };

        // 1. Exporters (Customers)
        const custData = extractData(custRes);
        if (custData.length > 0) {
          setExporters(custData);
        }

        // 2. Ports (POL / POD)
        const portData = extractData(portRes);
        if (portData.length > 0) {
          setPorts(portData);
        }

        // 3. Shipping Lines
        const lineData = extractData(shipLineRes);
        if (lineData.length > 0) {
          setShippingLines(lineData);
        }

        // 4. Container Types
        const contData = extractData(containerTypeRes);
        if (contData.length > 0) {
          setContainerTypes(contData);
        }

        // 5. UOM Master
        const uomData = extractData(uomRes);
        if (uomData.length > 0) {
          setUoms(uomData);
        }

      } catch (err) {
        console.error('Error fetching master dropdowns:', err);
      } finally {
        setIsDropdownsLoading(false);
      }
    };

    fetchLiveMasterDropdowns();
  }, []);

  // Initialize or populate form
  useEffect(() => {
    if (initialData) {
      const rawWeight = initialData.gross_weight || initialData.weight || '';
      const parsedWeight = parseWeightString(rawWeight);
      setFormData({
        inquiry_no: initialData.inquiry_no || generateInquiryNo(existingCount),
        exporter_id: initialData.exporter_id || initialData.customer_id || '',
        exporter_name: initialData.exporter_name || initialData.customer_name || '',
        pol: initialData.pol || initialData.origin || '',
        pod: initialData.pod || initialData.destination || '',
        fpod: initialData.fpod || '',
        commodity: initialData.commodity || '',
        hsn_code: initialData.hsn_code || '',
        cargo_type: initialData.cargo_type || 'General',
        gross_weight: rawWeight,
        weight_value: parsedWeight.val,
        weight_uom: parsedWeight.uom,
        container_type: initialData.container_type || "20'",
        no_of_containers: initialData.no_of_containers || initialData.quantity || '1',
        shipment_terms: initialData.shipment_terms || 'FOB',
        cargo_ready_date: initialData.cargo_ready_date ? initialData.cargo_ready_date.split('T')[0] : '',
        stuffing_location: initialData.stuffing_location || 'Factory',
        stuffing_location_other: initialData.stuffing_location_other || '',
        shipping_line_preference: initialData.shipping_line_preference || '',
        free_days_required: initialData.free_days_required !== undefined ? String(initialData.free_days_required) : '',
        special_requirements: initialData.special_requirements || initialData.remarks || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Pending'
      });
    } else {
      setFormData(prev => ({
        ...prev,
        inquiry_no: generateInquiryNo(existingCount)
      }));
    }
  }, [initialData, existingCount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'exporter_id') {
      const selectedExp = exporters.find(c => String(c.id) === String(value));
      setFormData(prev => ({
        ...prev,
        exporter_id: value,
        exporter_name: selectedExp ? (selectedExp.customer_name || selectedExp.name || selectedExp.company_name) : ''
      }));
    } else if (name === 'pol') {
      setFormData(prev => ({
        ...prev,
        pol: value,
        pod: prev.pod === value ? '' : prev.pod
      }));
    } else if (name === 'pod') {
      setFormData(prev => ({
        ...prev,
        pod: value,
        pol: prev.pol === value ? '' : prev.pol
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGlobalError('');

    const finalWeight = formData.weight_value 
      ? `${formData.weight_value} ${formData.weight_uom || 'KG'}`.trim()
      : formData.gross_weight;

    // --- Validation Rules ---
    if (!formData.exporter_id && !formData.exporter_name) {
      setGlobalError('Exporter is mandatory. Please select an Exporter.');
      return;
    }
    if (!formData.pol) {
      setGlobalError('Port of Loading (POL) is mandatory.');
      return;
    }
    if (!formData.pod) {
      setGlobalError('Port of Discharge (POD) is mandatory.');
      return;
    }
    if (formData.pol.trim().toLowerCase() === formData.pod.trim().toLowerCase()) {
      setGlobalError('Port of Loading (POL) and Port of Discharge (POD) cannot be identical.');
      return;
    }
    if (!formData.commodity.trim()) {
      setGlobalError('Commodity description is mandatory.');
      return;
    }
    if (!formData.hsn_code.trim()) {
      setGlobalError('HSN Code is mandatory for quotation preparation.');
      return;
    }
    if (!formData.container_type) {
      setGlobalError('Container Requirement is mandatory.');
      return;
    }
    const containerCount = parseInt(formData.no_of_containers, 10);
    if (isNaN(containerCount) || containerCount <= 0) {
      setGlobalError('No. of Containers must be a positive integer greater than 0.');
      return;
    }
    if (!finalWeight) {
      setGlobalError('Gross Weight per container is mandatory.');
      return;
    }
    if (!formData.cargo_ready_date) {
      setGlobalError('Expected Cargo Ready Date is mandatory.');
      return;
    }
    if (formData.stuffing_location === 'Other' && !formData.stuffing_location_other.trim()) {
      setGlobalError('Please specify the stuffing location details when "Other" is selected.');
      return;
    }
    if (formData.free_days_required !== '' && formData.free_days_required !== null) {
      const days = parseInt(formData.free_days_required, 10);
      if (isNaN(days) || days < 0) {
        setGlobalError('Free Days Required cannot be negative.');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Build updated payload ensuring 100% backward compatibility for legacy list/search views
      const payload = {
        ...formData,
        gross_weight: finalWeight,
        quantity: containerCount,
        weight: finalWeight,
        customer_id: formData.exporter_id,
        customer_name: formData.exporter_name,
        origin: formData.pol,
        destination: formData.pod,
        remarks: formData.special_requirements,
        mode: 'Sea',
        id: isEditMode ? initialData.id : `inq_${Date.now()}`,
        created_at: isEditMode ? initialData.created_at : new Date().toISOString()
      };
      
      onSuccess && onSuccess(payload);
    } catch (err) {
      setGlobalError(err.message || 'Failed to save Shipping Inquiry');
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

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
      <div className="flex justify-between align-center mb-md border-b-light pb-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
        <div>
          <h2 className="text-lg font-semibold m-0" style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: 600 }}>
            {isEditMode ? `Edit Export Shipment Inquiry (${formData.inquiry_no})` : 'New Export Shipment Inquiry'}
          </h2>
          <p className="text-xs text-tertiary m-0 mt-xs" style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Capture exporter, routing, cargo, and container requirements for export quotation preparation.
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
        
        {/* SECTION 1 — EXPORTER DETAILS */}
        <div style={sectionHeaderStyle}>
          <Building2 size={16} color="#1976D2" />
          <span>Section 1 — Exporter Details</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Inquiry No */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Inquiry No <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="text"
              name="inquiry_no"
              value={formData.inquiry_no}
              readOnly
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontWeight: 600, color: '#1976D2' }}
            />
            <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>System generated (Format: ESI/SS/MM-YY/001)</small>
          </div>

          {/* Exporter Dropdown */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Exporter <span style={{ color: '#d32f2f' }}>*</span></label>
            <select
              name="exporter_id"
              value={formData.exporter_id}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            >
              <option value="">Select Exporter (Customer Master)...</option>
              {exporters.map(exp => (
                <option key={exp.id} value={exp.id}>
                  {exp.customer_name || exp.name || exp.company_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 2 — ROUTING DETAILS */}
        <div style={sectionHeaderStyle}>
          <MapPin size={16} color="#1976D2" />
          <span>Section 2 — Routing Details</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* POL */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Port of Loading (POL) <span style={{ color: '#d32f2f' }}>*</span></label>
            <select
              name="pol"
              value={formData.pol}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            >
              <option value="">Select Port of Loading (POL)...</option>
              {ports.map(p => {
                const label = typeof p === 'object' ? (p.port_name || p.name || p.port_code) : p;
                return (
                  <option key={typeof p === 'object' ? (p.id || label) : p} value={label} disabled={label === formData.pod}>
                    {label} {label === formData.pod ? ' (Selected as POD)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* POD */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Port of Discharge (POD) <span style={{ color: '#d32f2f' }}>*</span></label>
            <select
              name="pod"
              value={formData.pod}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            >
              <option value="">Select Port of Discharge (POD)...</option>
              {ports.map(p => {
                const label = typeof p === 'object' ? (p.port_name || p.name || p.port_code) : p;
                return (
                  <option key={typeof p === 'object' ? (p.id || label) : p} value={label} disabled={label === formData.pol}>
                    {label} {label === formData.pol ? ' (Selected as POL)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* FPOD */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Final Place of Delivery (FPOD) <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="fpod"
              value={formData.fpod}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. Inland Depot / Destination ICD / Factory"
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
        </div>

        {/* SECTION 3 — CARGO DETAILS */}
        <div style={sectionHeaderStyle}>
          <Package size={16} color="#1976D2" />
          <span>Section 3 — Cargo Details</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Commodity */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Commodity <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="text"
              name="commodity"
              value={formData.commodity}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. Cotton Yarn / Ceramic Tiles"
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            />
          </div>

          {/* HSN Code */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>HSN Code <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="text"
              name="hsn_code"
              value={formData.hsn_code}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. 5205.12 / 6907.21"
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            />
          </div>

          {/* Cargo Type */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Cargo Type <span style={{ color: '#d32f2f' }}>*</span></label>
            <select
              name="cargo_type"
              value={formData.cargo_type}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            >
              <option value="General">General Cargo</option>
              <option value="Hazardous">Hazardous (HAZ)</option>
              <option value="Reefer">Reefer (Temperature Controlled)</option>
              <option value="OOG">OOG (Out of Gauge / Overdimensional)</option>
            </select>
          </div>

          {/* Gross Weight with UOM Master Dropdown */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Gross Weight (per container) <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                name="weight_value"
                value={formData.weight_value || ''}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="e.g. 24000"
                className="form-control form-control-sm"
                style={{ width: '60%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                required
              />
              <select
                name="weight_uom"
                value={formData.weight_uom || 'KG'}
                onChange={handleChange}
                disabled={isLoading}
                className="form-control form-control-sm"
                style={{ width: '40%', padding: '0.45rem 0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontWeight: 600, backgroundColor: '#f8fafc' }}
                required
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
        </div>

        {/* SECTION 4 — CONTAINER REQUIREMENTS */}
        <div style={sectionHeaderStyle}>
          <Box size={16} color="#1976D2" />
          <span>Section 4 — Container Requirements</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Container Requirement */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Container Requirement <span style={{ color: '#d32f2f' }}>*</span></label>
            <select
              name="container_type"
              value={formData.container_type}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            >
              <option value="">Select Container Type...</option>
              {containerTypes.map(ct => {
                const code = typeof ct === 'object' ? (ct.container_code || ct.code) : ct;
                const name = typeof ct === 'object' ? (ct.container_name || ct.name) : ct;
                const label = code && name && code !== name ? `${code} - ${name}` : (code || name);
                const val = code || name;
                return (
                  <option key={typeof ct === 'object' ? (ct.id || val) : ct} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* No. of Containers */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>No. of Containers <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="number"
              min="1"
              step="1"
              name="no_of_containers"
              value={formData.no_of_containers}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. 2"
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            />
          </div>
        </div>

        {/* SECTION 5 — COMMERCIAL / SHIPMENT TERMS */}
        <div style={sectionHeaderStyle}>
          <FileText size={16} color="#1976D2" />
          <span>Section 5 — Commercial / Shipment Terms</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Shipment Terms */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Shipment Terms (Incoterms) <span style={{ color: '#d32f2f' }}>*</span></label>
            <select
              name="shipment_terms"
              value={formData.shipment_terms}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            >
              <option value="FOB">FOB — Free On Board</option>
              <option value="CIF">CIF — Cost, Insurance & Freight</option>
              <option value="CFR">CFR — Cost & Freight</option>
              <option value="EXW">EXW — Ex Works</option>
            </select>
          </div>
        </div>

        {/* SECTION 6 — STUFFING & CARGO READINESS */}
        <div style={sectionHeaderStyle}>
          <Calendar size={16} color="#1976D2" />
          <span>Section 6 — Stuffing & Cargo Readiness</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Expected Cargo Ready Date */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Expected Cargo Ready Date <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="date"
              name="cargo_ready_date"
              value={formData.cargo_ready_date}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            />
          </div>

          {/* Stuffing Location */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Stuffing Location <span style={{ color: '#d32f2f' }}>*</span></label>
            <select
              name="stuffing_location"
              value={formData.stuffing_location}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            >
              <option value="Factory">Factory Stuffing</option>
              <option value="CFS">CFS Stuffing (Container Freight Station)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Conditional Stuffing Location Other */}
          {formData.stuffing_location === 'Other' && (
            <div className="form-group">
              <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Specify Stuffing Location <span style={{ color: '#d32f2f' }}>*</span></label>
              <input
                type="text"
                name="stuffing_location_other"
                value={formData.stuffing_location_other}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="e.g. Private Warehouse, Morbi / Sanand"
                className="form-control form-control-sm"
                style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                required
              />
            </div>
          )}
        </div>

        {/* SECTION 7 — SHIPPING LINE & FREE DAYS */}
        <div style={sectionHeaderStyle}>
          <Ship size={16} color="#1976D2" />
          <span>Section 7 — Carrier & Commercial Requirements</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Shipping Line Preference */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Shipping Line Preference <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <select
              name="shipping_line_preference"
              value={formData.shipping_line_preference}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="">No Line Preference (Any Line)</option>
              {shippingLines.map(sl => {
                const name = typeof sl === 'object' ? (sl.name || sl.shipping_line_name || sl.line_name) : sl;
                return (
                  <option key={typeof sl === 'object' ? (sl.id || name) : sl} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Free Days Required */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Free Days Required <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="number"
              min="0"
              name="free_days_required"
              value={formData.free_days_required}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. 14 Days"
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
        </div>

        {/* SECTION 8 — SPECIAL REQUIREMENTS & STATUS */}
        <div style={sectionHeaderStyle}>
          <FileText size={16} color="#1976D2" />
          <span>Section 8 — Special Requirements & Operational Status</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Priority */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Inquiry Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="Pending">Pending</option>
              <option value="Quoted">Quoted</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Special Requirements Textarea */}
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="text-sm font-medium" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Special Requirements / Exporter Instructions <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
          <textarea
            name="special_requirements"
            rows="3"
            value={formData.special_requirements}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Specify any carrier preferences, temperature settings, hazardous class, documentation instructions..."
            className="form-control form-control-sm"
            style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db', resize: 'vertical' }}
          />
        </div>

        {/* Form Action Buttons */}
        <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading} leftIcon={Check}>
            {isEditMode ? 'Update Inquiry' : 'Save Inquiry'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShippingInquiryForm;

