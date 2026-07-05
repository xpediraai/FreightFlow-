import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { foundationService } from '../../../../../masters/services/foundation.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const CountryForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    country_code: '',
    country_name: '',
    phone_code: '',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        country_code: initialData.country_code || '',
        country_name: initialData.country_name || '',
        phone_code: initialData.phone_code || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'country_code' && !value.trim()) error = 'Country Code is required';
    if (name === 'country_name' && !value.trim()) error = 'Country Name is required';
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
        await foundationService.updateCountry(initialData.id, formData);
      } else {
        await foundationService.createCountry(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} country`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Country' : 'Create New Country'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Country Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="country_code" 
              value={formData.country_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.country_code && <div className="text-danger text-xs mt-xs">{errors.country_code}</div>}
          </div>
          <div className="form-group">
            <label>Country Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="country_name" 
              value={formData.country_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.country_name && <div className="text-danger text-xs mt-xs">{errors.country_name}</div>}
          </div>
          <div className="form-group">
            <label>Phone Code</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="phone_code" 
              value={formData.phone_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          {isEditMode && (
            <div className="form-group">
              <label>Status</label>
              <StatusToggle 
              value={formData.status} 
              onChange={(val) => handleChange({ target: { name: 'status', value: val } })}
              disabled={isLoading}
            />
            </div>
          )}
        </div>

        <div className="form-actions mt-lg flex justify-end gap-sm pt-md border-t-light">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading}>
            {isEditMode ? 'Update Country' : 'Create Country'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CountryForm;
