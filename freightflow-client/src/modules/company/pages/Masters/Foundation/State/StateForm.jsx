import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { foundationService } from '../../../../../masters/services/foundation.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const StateForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [countries, setCountries] = useState([]);
  
  const [formData, setFormData] = useState({
    country_id: '',
    state_code: '',
    state_name: '',
    gst_state_code: '',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchCountries();
    if (initialData) {
      setFormData({
        country_id: initialData.country_id || '',
        state_code: initialData.state_code || '',
        state_name: initialData.state_name || '',
        gst_state_code: initialData.gst_state_code || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const fetchCountries = async () => {
    try {
      const data = await foundationService.getCountries();
      let countryData = [];
      if (data?.data?.data && Array.isArray(data.data.data)) {
        countryData = data.data.data;
      } else if (data?.data && Array.isArray(data.data)) {
        countryData = data.data;
      } else if (Array.isArray(data)) {
        countryData = data;
      }
      setCountries(countryData);
    } catch (err) {
      console.error('Failed to fetch countries', err);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'country_id' && !value) error = 'Country is required';
    if (name === 'state_code' && !value.trim()) error = 'State Code is required';
    if (name === 'state_name' && !value.trim()) error = 'State Name is required';
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
        await foundationService.updateState(initialData.id, formData);
      } else {
        await foundationService.createState(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} state`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit State' : 'Create New State'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Country <span className="text-danger">*</span></label>
            <select
              disabled={isLoading}
              name="country_id"
              value={formData.country_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-control form-control-sm"
            >
              <option value="">Select Country</option>
              {countries
                .filter(country => country.status === 'Active' || country.id === formData.country_id)
                .map(country => (
                  <option key={country.id} value={country.id}>
                    {country.country_name} ({country.country_code})
                  </option>
              ))}
            </select>
            {errors.country_id && <div className="text-danger text-xs mt-xs">{errors.country_id}</div>}
          </div>

          <div className="form-group">
            <label>State Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="state_code" 
              value={formData.state_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.state_code && <div className="text-danger text-xs mt-xs">{errors.state_code}</div>}
          </div>

          <div className="form-group">
            <label>State Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="state_name" 
              value={formData.state_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.state_name && <div className="text-danger text-xs mt-xs">{errors.state_name}</div>}
          </div>

          <div className="form-group">
            <label>GST State Code</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="gst_state_code" 
              value={formData.gst_state_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <StatusToggle 
              value={formData.status} 
              onChange={(val) => handleChange({ target: { name: 'status', value: val } })}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-actions mt-lg flex justify-end gap-sm pt-md border-t-light">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading}>
            {isEditMode ? 'Update State' : 'Create State'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StateForm;
