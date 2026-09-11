import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, User, Check, Plus, FileText } from 'lucide-react';
import Button from '../../../../../shared/components/Button';

const SAMPLE_SAVED_FACTORIES = [
  {
    id: 'fac_1',
    factory_name: 'Apex Global Logistics - Unit 1 (Morbi Plant)',
    factory_address: 'Plot No. 45-B, GIDC Phase II, National Highway 8-A',
    city: 'Morbi',
    state: 'Gujarat',
    pincode: '363642',
    contact_person: 'Mr. Rajesh Mehta (Plant In-Charge)',
    contact_phone: '+91 98765 43210',
    gstin: '24AAACA1234A1Z5'
  },
  {
    id: 'fac_2',
    factory_name: 'Gujarat Textiles Pvt Ltd - Spinning Mill #2',
    factory_address: 'Survey No. 128, Sanand Industrial Area, Block C',
    city: 'Sanand',
    state: 'Gujarat',
    pincode: '382110',
    contact_person: 'Suresh Patel (Logistics Lead)',
    contact_phone: '+91 98250 99887',
    gstin: '24BBBCB5678B2Z1'
  },
  {
    id: 'fac_3',
    factory_name: 'Orient Freight Corp - Central ICD Warehouse',
    factory_address: 'Near Container Freight Station, Pipeline Road, Hazira',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '394270',
    contact_person: 'Amit Shah (Dispatch Manager)',
    contact_phone: '+91 99090 11223',
    gstin: '24CCCC09090C3Z9'
  }
];

const FactorySelectionModal = ({
  isOpen,
  onClose,
  onSave,
  initialFactory = {},
  exporterName = ''
}) => {
  const [formData, setFormData] = useState({
    factory_name: '',
    factory_address: '',
    city: '',
    state: 'Gujarat',
    pincode: '',
    contact_person: '',
    contact_phone: '',
    gstin: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialFactory && (initialFactory.factory_name || initialFactory.factory_address)) {
      setFormData({
        factory_name: initialFactory.factory_name || '',
        factory_address: initialFactory.factory_address || '',
        city: initialFactory.city || initialFactory.factory_city || '',
        state: initialFactory.state || initialFactory.factory_state || 'Gujarat',
        pincode: initialFactory.pincode || initialFactory.factory_pincode || '',
        contact_person: initialFactory.contact_person || initialFactory.factory_contact_person || '',
        contact_phone: initialFactory.contact_phone || initialFactory.factory_contact_phone || '',
        gstin: initialFactory.gstin || initialFactory.factory_gstin || ''
      });
    } else {
      setFormData({
        factory_name: '',
        factory_address: '',
        city: '',
        state: 'Gujarat',
        pincode: '',
        contact_person: '',
        contact_phone: '',
        gstin: ''
      });
    }
  }, [initialFactory, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectPreset = (factory) => {
    setFormData({
      factory_name: factory.factory_name,
      factory_address: factory.factory_address,
      city: factory.city,
      state: factory.state,
      pincode: factory.pincode,
      contact_person: factory.contact_person,
      contact_phone: factory.contact_phone,
      gstin: factory.gstin
    });
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.factory_name.trim()) {
      setErrorMsg('Factory / Plant Name is mandatory.');
      return;
    }
    if (!formData.factory_address.trim()) {
      setErrorMsg('Factory Street Address is mandatory.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('City is mandatory.');
      return;
    }

    onSave && onSave(formData);
    onClose && onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc',
            borderRadius: '10px 10px 0 0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={22} color="#1976D2" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: 600 }}>
                Factory Stuffing Address & Location Details
              </h3>
              {exporterName && (
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Exporter: <strong>{exporterName}</strong>
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                borderLeft: '4px solid #ef5350',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Quick Select Preset Factories */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Quick Select Saved Factory Locations:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {SAMPLE_SAVED_FACTORIES.map(fac => (
                <div
                  key={fac.id}
                  onClick={() => handleSelectPreset(fac)}
                  style={{
                    border: formData.factory_name === fac.factory_name ? '2px solid #1976D2' : '1px solid #e2e8f0',
                    backgroundColor: formData.factory_name === fac.factory_name ? '#f0f9ff' : '#ffffff',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{fac.factory_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {fac.factory_address}, {fac.city}, {fac.state} - {fac.pincode}
                    </div>
                  </div>
                  <Button type="button" variant={formData.factory_name === fac.factory_name ? "primary" : "outline"} size="xs">
                    {formData.factory_name === fac.factory_name ? "Selected" : "Select"}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1976D2', display: 'block', marginBottom: '0.75rem' }}>
              Or Customize / Enter Factory Details Manually:
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              
              {/* Factory Name */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.3rem' }}>
                  Factory / Plant Name <span style={{ color: '#d32f2f' }}>*</span>
                </label>
                <input
                  type="text"
                  name="factory_name"
                  value={formData.factory_name}
                  onChange={handleChange}
                  placeholder="e.g. Apex Global Textiles - Factory Unit 1"
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>

              {/* Address Line */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.3rem' }}>
                  Factory Street Address / GIDC Plot No. <span style={{ color: '#d32f2f' }}>*</span>
                </label>
                <input
                  type="text"
                  name="factory_address"
                  value={formData.factory_address}
                  onChange={handleChange}
                  placeholder="e.g. Plot No. 45-B, Industrial Estate, National Highway 8-A"
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>

              {/* City */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.3rem' }}>
                  City / Location <span style={{ color: '#d32f2f' }}>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Morbi / Sanand / Surat"
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>

              {/* State */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.3rem' }}>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Gujarat"
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              {/* Pincode */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.3rem' }}>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 363642"
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              {/* Contact Person */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.3rem' }}>Factory Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="e.g. Mr. Rajesh Mehta (Plant In-Charge)"
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.3rem' }}>Contact Phone</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              {/* GSTIN */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.35rem' }}>Factory GSTIN</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="e.g. 24AAACA1234A1Z5"
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" leftIcon={Check}>Save & Apply Factory Address</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FactorySelectionModal;
