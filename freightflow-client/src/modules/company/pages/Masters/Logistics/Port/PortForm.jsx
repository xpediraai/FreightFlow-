import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const PortForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    port_code: '',
    port_name: '',
    country_id: '',
    state_id: '',
    city_id: '',
    time_zone: '',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        port_code: initialData.port_code || '',
        port_name: initialData.port_name || '',
        country_id: initialData.country_id || '',
        state_id: initialData.state_id || '',
        city_id: initialData.city_id || '',
        time_zone: initialData.time_zone || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'port_code' && !String(value).trim()) error = 'Port Code is required';
    if (name === 'port_name' && !String(value).trim()) error = 'Port Name is required';
    if (name === 'country_id' && !String(value).trim()) error = 'Country ID is required';
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
        await logisticsService.updatePort(initialData.id, formData);
      } else {
        await logisticsService.createPort(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} port`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Port' : 'Create New Port'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Port Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="port_code" 
              value={formData.port_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.port_code && <div className="text-danger text-xs mt-xs">{errors.port_code}</div>}
          </div>
          <div className="form-group">
            <label>Port Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="port_name" 
              value={formData.port_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.port_name && <div className="text-danger text-xs mt-xs">{errors.port_name}</div>}
          </div>
          <div className="form-group">
            <label>Country ID (UUID) <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="country_id" 
              value={formData.country_id} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm"
              placeholder="Enter Country UUID"
            />
            {errors.country_id && <div className="text-danger text-xs mt-xs">{errors.country_id}</div>}
          </div>
          <div className="form-group">
            <label>State ID (UUID)</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="state_id" 
              value={formData.state_id} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm"
              placeholder="Enter State UUID"
            />
          </div>
          <div className="form-group">
            <label>City ID (UUID)</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="city_id" 
              value={formData.city_id} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm"
              placeholder="Enter City UUID"
            />
          </div>
          <div className="form-group">
            <label>Time Zone</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="time_zone" 
              value={formData.time_zone} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
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
            {isEditMode ? 'Update Port' : 'Create Port'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PortForm;
