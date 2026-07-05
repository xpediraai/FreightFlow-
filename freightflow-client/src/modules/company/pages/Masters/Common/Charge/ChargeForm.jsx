import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { businessService } from '../../../../../masters/services/business.service';
import { foundationService } from '../../../../../masters/services/foundation.service';

const ChargeForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currencies, setCurrencies] = useState([]);

  const [formData, setFormData] = useState({
    charge_code: '',
    charge_name: '',
    charge_type: 'Revenue',
    applicable_module: 'Shipment',
    tax_applicable: false,
    default_currency: '',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const currRes = await foundationService.getCurrencies();
        let data = [];
        if (currRes?.data?.data?.data && Array.isArray(currRes.data.data.data)) {
          data = currRes.data.data.data;
        } else if (currRes?.data?.data && Array.isArray(currRes.data.data)) {
          data = currRes.data.data;
        } else if (currRes?.data && Array.isArray(currRes.data)) {
          data = currRes.data;
        }
        setCurrencies(data.filter(c => c.status === 'Active'));
      } catch (err) {
        console.error('Failed to fetch currencies:', err);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.charge_name.trim() || !formData.charge_code.trim()) {
      setError('Charge Code and Name are required.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.default_currency) payload.default_currency = null;

      if (isEditMode) {
        await businessService.updateCharge(initialData.id, payload);
      } else {
        await businessService.createCharge(payload);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save charge');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Charge' : 'Create New Charge'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {error && <div className="alert alert-danger mb-md p-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="dense-form form-grid">
        <div className="form-group">
          <label>Charge Code *</label>
          <input disabled={isLoading} required type="text" name="charge_code" value={formData.charge_code} onChange={handleChange} className="form-control form-control-sm uppercase" />
        </div>
        <div className="form-group">
          <label>Charge Name *</label>
          <input disabled={isLoading} required type="text" name="charge_name" value={formData.charge_name} onChange={handleChange} className="form-control form-control-sm" />
        </div>
        <div className="form-group">
          <label>Charge Type</label>
          <select disabled={isLoading} name="charge_type" value={formData.charge_type} onChange={handleChange} className="form-control form-control-sm">
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expense</option>
            <option value="Both">Both</option>
          </select>
        </div>
        <div className="form-group">
          <label>Applicable Module</label>
          <select disabled={isLoading} name="applicable_module" value={formData.applicable_module} onChange={handleChange} className="form-control form-control-sm">
            <option value="Inquiry">Inquiry</option>
            <option value="Quotation">Quotation</option>
            <option value="Shipment">Shipment</option>
            <option value="Customs">Customs</option>
            <option value="Billing">Billing</option>
            <option value="Transport">Transport</option>
          </select>
        </div>
        <div className="form-group">
          <label>Default Currency</label>
          <select disabled={isLoading} name="default_currency" value={formData.default_currency || ''} onChange={handleChange} className="form-control form-control-sm">
            <option value="">Select Currency...</option>
            {currencies.map(c => (
              <option key={c.id} value={c.id}>{c.currency_code} - {c.currency_name}</option>
            ))}
          </select>
        </div>
        <div className="form-group flex align-center mt-md gap-sm">
          <input disabled={isLoading} type="checkbox" name="tax_applicable" id="tax_applicable" checked={formData.tax_applicable} onChange={handleChange} />
          <label htmlFor="tax_applicable" className="mb-0 cursor-pointer">Tax Applicable</label>
        </div>
        
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Description</label>
          <textarea disabled={isLoading} name="description" value={formData.description} onChange={handleChange} className="form-control form-control-sm" rows="3" />
        </div>

        {isEditMode && (
          <div className="form-group">
            <label>Status</label>
            <select disabled={isLoading} name="status" value={formData.status} onChange={handleChange} className="form-control form-control-sm">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
        
        <div className="form-actions flex justify-end gap-sm" style={{ gridColumn: '1 / -1' }}>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading}>
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChargeForm;
