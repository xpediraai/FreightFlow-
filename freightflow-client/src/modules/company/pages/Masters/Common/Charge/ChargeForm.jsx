import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { businessService } from '../../../../../masters/services/business.service';
import { foundationService } from '../../../../../masters/services/foundation.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const ChargeForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currencies, setCurrencies] = useState([]);

  const [formData, setFormData] = useState({
    charge_code: '',
    charge_name: '',
    basis: 'Per Container',
    default_rate: '',
    default_qty: '1',
    default_applicable: true,
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
      const apiPayload = {
        charge_code: formData.charge_code.trim(),
        charge_name: formData.charge_name.trim(),
        basis: formData.basis || 'Per Container',
        default_rate: formData.default_rate !== '' ? Number(formData.default_rate) : 0,
        default_qty: formData.default_qty !== '' ? Number(formData.default_qty) : 1,
        default_applicable: !!formData.default_applicable,
        charge_type: formData.charge_type || 'Revenue',
        applicable_module: formData.applicable_module || 'Quotation',
        tax_applicable: !!formData.tax_applicable,
        default_currency: formData.default_currency || null,
        description: formData.description || '',
        status: formData.status || 'Active'
      };

      let apiResult = null;
      try {
        if (isEditMode) {
          const res = await businessService.updateCharge(initialData.id, apiPayload);
          apiResult = res?.data || res;
        } else {
          const res = await businessService.createCharge(apiPayload);
          apiResult = res?.data || res;
        }
      } catch (apiErr) {
        console.warn('Backend API submit failed, saving to local storage fallback:', apiErr);
      }

      const generatedId = isEditMode ? initialData.id : (apiResult?.id || `cm_${Date.now()}`);
      const localPayload = {
        ...apiPayload,
        id: generatedId,
        updated_at: new Date().toISOString()
      };

      // Sync to local storage fallback
      try {
        const localRaw = localStorage.getItem('freightflow_charge_masters');
        let localList = localRaw ? JSON.parse(localRaw) : [];
        if (isEditMode) {
          localList = localList.map(item => String(item.id) === String(initialData.id) ? localPayload : item);
        } else {
          localList = localList.filter(item => String(item.id) !== String(generatedId));
          localList.unshift(localPayload);
        }
        localStorage.setItem('freightflow_charge_masters', JSON.stringify(localList));
      } catch (lErr) {
        console.error('Failed sync to local storage:', lErr);
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
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Charge Master' : 'Create New Charge Master Head'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {error && <div className="alert alert-danger mb-md p-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="dense-form form-grid">
        <div className="form-group">
          <label>Charge Code *</label>
          <input disabled={isLoading} required type="text" name="charge_code" value={formData.charge_code} onChange={handleChange} className="form-control form-control-sm uppercase" placeholder="e.g. OF, THC, BLC" />
        </div>

        <div className="form-group">
          <label>Charge / Service Description *</label>
          <input disabled={isLoading} required type="text" name="charge_name" value={formData.charge_name} onChange={handleChange} className="form-control form-control-sm" placeholder="e.g. Ocean Freight [POL to POD]" />
        </div>

        <div className="form-group">
          <label>Basis / Unit *</label>
          <select disabled={isLoading} name="basis" value={formData.basis || 'Per Container'} onChange={handleChange} className="form-control form-control-sm">
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
        </div>

        <div className="form-group">
          <label>Default Rate (₹)</label>
          <input disabled={isLoading} type="number" min="0" name="default_rate" value={formData.default_rate} onChange={handleChange} className="form-control form-control-sm text-right" placeholder="e.g. 85000" />
        </div>

        <div className="form-group">
          <label>Default Quantity</label>
          <input disabled={isLoading} type="number" min="1" name="default_qty" value={formData.default_qty} onChange={handleChange} className="form-control form-control-sm text-center" placeholder="1" />
        </div>

        <div className="form-group">
          <label>Charge Type</label>
          <select disabled={isLoading} name="charge_type" value={formData.charge_type} onChange={handleChange} className="form-control form-control-sm">
            <option value="Revenue">Revenue / Income</option>
            <option value="Expense">Expense / Cost</option>
          </select>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          <input disabled={isLoading} type="checkbox" id="default_applicable" name="default_applicable" checked={!!formData.default_applicable} onChange={handleChange} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
          <label htmlFor="default_applicable" style={{ cursor: 'pointer', margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Apply by Default in Export Quotations</label>
        </div>

        <div className="form-group">
          <label>Status</label>
          <StatusToggle 
            value={formData.status} 
            onChange={(val) => handleChange({ target: { name: 'status', value: val } })}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-actions flex justify-end gap-sm" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading}>
            {isEditMode ? 'Update Charge Master' : 'Create Charge Master'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChargeForm;
