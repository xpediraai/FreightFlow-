import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
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

const DEFAULT_CUSTOMERS = [
  { id: 'c1', customer_name: 'Apex Global Logistics Ltd' },
  { id: 'c2', customer_name: 'Sunlight Exports & Trading' },
  { id: 'c3', customer_name: 'Gujarat Textiles Pvt Ltd' },
  { id: 'c4', customer_name: 'Orient Shipping & Freight Corp' },
];

const DEFAULT_LOCATIONS = [
  'Ahmedabad', 'Surat', 'Mumbai (Nhava Sheva)', 'Mundra Port', 
  'Delhi', 'Dubai (Jebel Ali)', 'Rotterdam', 'Singapore', 'London', 'New York'
];

const DEFAULT_TRANSPORT_MODES = ['Sea', 'Air', 'Land'];

const DEFAULT_CONTAINER_TYPES = [
  { id: 'ct1', container_code: '20GP', container_name: '20ft General Purpose' },
  { id: 'ct2', container_code: '40GP', container_name: '40ft General Purpose' },
  { id: 'ct3', container_code: '40HC', container_name: '40ft High Cube' },
  { id: 'ct4', container_code: '20RF', container_name: '20ft Reefer' },
  { id: 'ct5', container_code: '40RF', container_name: '40ft Reefer' },
  { id: 'ct6', container_code: '20OT', container_name: '20ft Open Top' },
  { id: 'ct7', container_code: '40FR', container_name: '40ft Flat Rack' }
];

const ShippingInquiryForm = ({ onCancel, onSuccess, initialData, existingCount = 0 }) => {
  const isEditMode = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownsLoading, setIsDropdownsLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  // Dropdown States (Live API Data + Static Defaults)
  const [customers, setCustomers] = useState(DEFAULT_CUSTOMERS);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [transportModes, setTransportModes] = useState(DEFAULT_TRANSPORT_MODES);
  const [containerTypes, setContainerTypes] = useState(DEFAULT_CONTAINER_TYPES);

  const [formData, setFormData] = useState({
    inquiry_no: '',
    customer_id: '',
    customer_name: '',
    origin: '',
    destination: '',
    commodity: '',
    container_type: '',
    quantity: '',
    weight: '',
    mode: 'Sea',
    priority: 'Medium',
    status: 'Pending',
    remarks: ''
  });

  useEffect(() => {
    const fetchLiveMasterDropdowns = async () => {
      setIsDropdownsLoading(true);
      try {
        const [custRes, cityRes, portRes, modeRes, containerTypeRes] = await Promise.allSettled([
          businessService.getCustomers(),
          foundationService.getCities(),
          logisticsService.getPorts(),
          commonService.getTransportModes(),
          commonService.getContainerTypes()
        ]);

        const extractData = (res) => {
          if (res.status === 'fulfilled' && res.value) {
            const data = res.value?.data?.data?.data || res.value?.data?.data || res.value?.data;
            if (Array.isArray(data)) return data;
          }
          return [];
        };

        // 1. Customers
        const custData = extractData(custRes);
        if (custData.length > 0) {
          setCustomers(custData);
        } else {
          setCustomers(DEFAULT_CUSTOMERS);
        }

        // 2. Locations (Cities + Ports)
        const cityData = extractData(cityRes).map(c => c.city_name || c.name).filter(Boolean);
        const portData = extractData(portRes).map(p => p.port_name || p.name).filter(Boolean);
        const mergedLocations = Array.from(new Set([...cityData, ...portData]));
        if (mergedLocations.length > 0) {
          setLocations(mergedLocations);
        } else {
          setLocations(DEFAULT_LOCATIONS);
        }

        // 3. Transport Modes
        const modeData = extractData(modeRes).map(m => typeof m === 'object' ? (m.mode_name || m.name || m.mode_code) : m).filter(Boolean);
        if (modeData.length > 0) {
          setTransportModes(modeData);
        } else {
          setTransportModes(DEFAULT_TRANSPORT_MODES);
        }

        // 4. Container Types
        const contData = extractData(containerTypeRes);
        if (contData.length > 0) {
          setContainerTypes(contData);
        } else {
          setContainerTypes(DEFAULT_CONTAINER_TYPES);
        }

      } catch (err) {
        console.error('Error fetching master dropdowns:', err);
      } finally {
        setIsDropdownsLoading(false);
      }
    };

    fetchLiveMasterDropdowns();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
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
    if (name === 'customer_id') {
      const selectedCust = customers.find(c => String(c.id) === String(value));
      setFormData(prev => ({
        ...prev,
        customer_id: value,
        customer_name: selectedCust ? (selectedCust.customer_name || selectedCust.name) : ''
      }));
    } else if (name === 'origin') {
      setFormData(prev => ({
        ...prev,
        origin: value,
        destination: prev.destination === value ? '' : prev.destination
      }));
    } else if (name === 'destination') {
      setFormData(prev => ({
        ...prev,
        destination: value,
        origin: prev.origin === value ? '' : prev.origin
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGlobalError('');

    if (!formData.customer_id && !formData.customer_name) {
      setGlobalError('Please select a Customer.');
      return;
    }
    if (!formData.origin || !formData.destination) {
      setGlobalError('Origin and Destination are required.');
      return;
    }
    if (formData.origin === formData.destination) {
      setGlobalError('Origin and Destination cannot be the same city/port.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
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

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center mb-md border-b-light pb-sm">
        <div>
          <h2 className="text-lg font-semibold m-0">
            {isEditMode ? `Edit Shipping Inquiry (${formData.inquiry_no})` : 'Create New Shipping Inquiry'}
          </h2>
          <p className="text-xs text-tertiary m-0 mt-xs">Select options from dropdowns to create or update an inquiry.</p>
        </div>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm text-sm" style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.75rem', borderRadius: '4px' }}>{globalError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid pt-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          {/* Inquiry No */}
          <div className="form-group">
            <label className="text-sm font-medium">Inquiry No <span className="text-danger">*</span></label>
            <input
              type="text"
              name="inquiry_no"
              value={formData.inquiry_no}
              onChange={handleChange}
              readOnly={!isEditMode}
              className="form-control form-control-sm"
              style={{ backgroundColor: isEditMode ? 'var(--bg-surface)' : 'var(--bg-surface-hover)', fontWeight: 600, color: 'var(--color-primary)' }}
              required
            />
            <small className="text-tertiary text-xs" style={{ fontSize: '0.75rem', color: '#757575' }}>Format: ESI/SS/MM-YY/001</small>
          </div>

          {/* Customer Master Select Dropdown */}
          <div className="form-group">
            <label className="text-sm font-medium">Customer Master <span className="text-danger">*</span></label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              required
            >
              <option value="">Select Customer Master...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.customer_name || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transport Mode Select Dropdown */}
          <div className="form-group">
            <label className="text-sm font-medium">Transport Mode <span className="text-danger">*</span></label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              required
            >
              <option value="">Select Transport Mode...</option>
              {transportModes.map(m => {
                const modeVal = typeof m === 'object' ? (m.mode_name || m.name || m.mode_code) : m;
                return (
                  <option key={modeVal} value={modeVal}>
                    {modeVal}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Origin Select Dropdown (City/Port Master) */}
          <div className="form-group">
            <label className="text-sm font-medium">Origin (City / Port) <span className="text-danger">*</span></label>
            <select
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              required
            >
              <option value="">Select Origin (City / Port)...</option>
              {locations.map(loc => (
                <option key={loc} value={loc} disabled={loc === formData.destination}>
                  {loc} {loc === formData.destination ? ' (Selected as Destination)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Select Dropdown (City/Port Master) */}
          <div className="form-group">
            <label className="text-sm font-medium">Destination (City / Port) <span className="text-danger">*</span></label>
            <select
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
              required
            >
              <option value="">Select Destination (City / Port)...</option>
              {locations.map(loc => (
                <option key={loc} value={loc} disabled={loc === formData.origin}>
                  {loc} {loc === formData.origin ? ' (Selected as Origin)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Product / Commodity Input (Plain Text Input) */}
          <div className="form-group">
            <label className="text-sm font-medium">Product / Commodity</label>
            <input
              type="text"
              name="commodity"
              value={formData.commodity}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. Garments"
              className="form-control form-control-sm"
            />
          </div>

          {/* Container Type Master Select Dropdown */}
          <div className="form-group">
            <label className="text-sm font-medium">Container Type Master</label>
            <select
              name="container_type"
              value={formData.container_type}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
            >
              <option value="">Select Container Type...</option>
              {containerTypes.map(ct => {
                const name = typeof ct === 'object' ? (ct.container_name || ct.name || ct.container_code || ct.code) : ct;
                const code = typeof ct === 'object' ? (ct.container_code || ct.code) : '';
                const displayLabel = code && name && code !== name ? `${code} - ${name}` : (name || code);
                const id = typeof ct === 'object' ? (ct.id || name) : ct;
                return (
                  <option key={id} value={name}>
                    {displayLabel}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label className="text-sm font-medium">Quantity</label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. 100 Boxes"
              className="form-control form-control-sm"
            />
          </div>

          {/* Weight */}
          <div className="form-group">
            <label className="text-sm font-medium">Weight</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. 500 KG"
              className="form-control form-control-sm"
            />
          </div>

          {/* Status Dropdown */}
          <div className="form-group">
            <label className="text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
            >
              <option value="Pending">Pending</option>
              <option value="Quoted">Quoted</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Dropdown (Low, Medium, High) */}
          <div className="form-group">
            <label className="text-sm font-medium">Priority</label>
            <select
              name="priority"
              value={formData.priority || 'Medium'}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control form-control-sm"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

        </div>

        {/* Remarks */}
        <div className="form-group mt-md" style={{ marginTop: '1rem' }}>
          <label className="text-sm font-medium">Remarks / Special Instructions</label>
          <textarea
            name="remarks"
            rows="2"
            value={formData.remarks}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Add any specific container type, temperature, or handling requirements..."
            className="form-control form-control-sm"
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <div className="form-actions mt-xl flex justify-end gap-sm pt-md border-t-light" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
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
