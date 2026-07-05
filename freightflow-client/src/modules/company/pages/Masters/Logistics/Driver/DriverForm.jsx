import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { logisticsService } from '../../../../../masters/services/logistics.service';

const DriverForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    driver_code: '',
    driver_name: '',
    mobile: '',
    alternate_mobile: '',
    email: '',
    address: '',
    country_id: '',
    state_id: '',
    city_id: '',
    license_number: '',
    license_type: '',
    license_expiry: '',
    aadhaar_number: '',
    pan_number: '',
    vendor_id: '',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        driver_code: initialData.driver_code || '',
        driver_name: initialData.driver_name || '',
        mobile: initialData.mobile || '',
        alternate_mobile: initialData.alternate_mobile || '',
        email: initialData.email || '',
        address: initialData.address || '',
        country_id: initialData.country_id || '',
        state_id: initialData.state_id || '',
        city_id: initialData.city_id || '',
        license_number: initialData.license_number || '',
        license_type: initialData.license_type || '',
        license_expiry: formatDateForInput(initialData.license_expiry),
        aadhaar_number: initialData.aadhaar_number || '',
        pan_number: initialData.pan_number || '',
        vendor_id: initialData.vendor_id || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'driver_code' && !String(value).trim()) error = 'Driver Code is required';
    if (name === 'driver_name' && !String(value).trim()) error = 'Driver Name is required';
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
      const payload = { ...formData };
      if (!payload.license_expiry) payload.license_expiry = null;

      if (isEditMode) {
        await logisticsService.updateDriver(initialData.id, payload);
      } else {
        await logisticsService.createDriver(payload);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} driver`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Driver' : 'Create New Driver'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Driver Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="driver_code" 
              value={formData.driver_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm uppercase" 
            />
            {errors.driver_code && <div className="text-danger text-xs mt-xs">{errors.driver_code}</div>}
          </div>
          <div className="form-group">
            <label>Driver Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="driver_name" 
              value={formData.driver_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.driver_name && <div className="text-danger text-xs mt-xs">{errors.driver_name}</div>}
          </div>
          <div className="form-group">
            <label>Mobile</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="mobile" 
              value={formData.mobile} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Alternate Mobile</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="alternate_mobile" 
              value={formData.alternate_mobile} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              disabled={isLoading} 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>License Number</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="license_number" 
              value={formData.license_number} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm uppercase" 
            />
          </div>
          <div className="form-group">
            <label>License Type</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="license_type" 
              value={formData.license_type} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>License Expiry</label>
            <input 
              disabled={isLoading} 
              type="date" 
              name="license_expiry" 
              value={formData.license_expiry} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Aadhaar Number</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="aadhaar_number" 
              value={formData.aadhaar_number} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>PAN Number</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="pan_number" 
              value={formData.pan_number} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm uppercase" 
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Country ID (UUID)</label>
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
            <label>Vendor ID (UUID)</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="vendor_id" 
              value={formData.vendor_id} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm"
              placeholder="Enter Vendor UUID"
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
            {isEditMode ? 'Update Driver' : 'Create Driver'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DriverForm;
