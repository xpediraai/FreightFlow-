import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { foundationService } from '../../../../../masters/services/foundation.service';

const CurrencyForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    currency_code: '',
    currency_name: '',
    symbol: '',
    exchange_rate: 1.0000,
    base_currency: 'No',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        currency_code: initialData.currency_code || '',
        currency_name: initialData.currency_name || '',
        symbol: initialData.symbol || '',
        exchange_rate: initialData.exchange_rate || 1.0000,
        base_currency: initialData.base_currency || 'No',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'currency_code' && !String(value).trim()) error = 'Currency Code is required';
    if (name === 'currency_name' && !String(value).trim()) error = 'Currency Name is required';
    if (name === 'exchange_rate' && (isNaN(value) || Number(value) <= 0)) error = 'Valid exchange rate > 0 is required';
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      setGlobalError('Please fix the errors before submitting.');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isEditMode) {
        await foundationService.updateCurrency(initialData.id, formData);
      } else {
        await foundationService.createCurrency(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} currency`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Currency' : 'Create New Currency'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Currency Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="currency_code" 
              value={formData.currency_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.currency_code && <div className="text-danger text-xs mt-xs">{errors.currency_code}</div>}
          </div>
          <div className="form-group">
            <label>Currency Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="currency_name" 
              value={formData.currency_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.currency_name && <div className="text-danger text-xs mt-xs">{errors.currency_name}</div>}
          </div>
          <div className="form-group">
            <label>Symbol</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="symbol" 
              value={formData.symbol} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Exchange Rate <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="number" 
              step="0.0001"
              name="exchange_rate" 
              value={formData.exchange_rate} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.exchange_rate && <div className="text-danger text-xs mt-xs">{errors.exchange_rate}</div>}
          </div>
          <div className="form-group">
            <label>Base Currency</label>
            <select 
              disabled={isLoading} 
              name="base_currency" 
              value={formData.base_currency} 
              onChange={handleChange} 
              className="form-control form-control-sm"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {isEditMode && (
            <div className="form-group">
              <label>Status</label>
              <select 
                disabled={isLoading} 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="form-control form-control-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-actions mt-lg flex justify-end gap-sm pt-md border-t-light">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading}>
            {isEditMode ? 'Update Currency' : 'Create Currency'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CurrencyForm;
