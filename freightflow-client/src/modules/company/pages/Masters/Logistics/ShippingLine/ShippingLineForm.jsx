import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { logisticsService } from '../../../../../masters/services/logistics.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const ShippingLineForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    shipping_line_code: '',
    shipping_line_name: '',
    scac_code: '',
    website: '',
    email: '',
    phone: '',
    country_id: '',
    contact_person: '',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        shipping_line_code: initialData.shipping_line_code || '',
        shipping_line_name: initialData.shipping_line_name || '',
        scac_code: initialData.scac_code || '',
        website: initialData.website || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        country_id: initialData.country_id || '',
        contact_person: initialData.contact_person || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'shipping_line_code' && !String(value).trim()) error = 'Shipping Line Code is required';
    if (name === 'shipping_line_name' && !String(value).trim()) error = 'Shipping Line Name is required';
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
        await logisticsService.updateShippingLine(initialData.id, formData);
      } else {
        await logisticsService.createShippingLine(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} shipping line`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Shipping Line' : 'Create New Shipping Line'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Shipping Line Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="shipping_line_code" 
              value={formData.shipping_line_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.shipping_line_code && <div className="text-danger text-xs mt-xs">{errors.shipping_line_code}</div>}
          </div>
          <div className="form-group">
            <label>Shipping Line Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="shipping_line_name" 
              value={formData.shipping_line_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.shipping_line_name && <div className="text-danger text-xs mt-xs">{errors.shipping_line_name}</div>}
          </div>
          <div className="form-group">
            <label>SCAC Code</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="scac_code" 
              value={formData.scac_code} 
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
            <label>Contact Person</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="contact_person" 
              value={formData.contact_person} 
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
            <label>Phone</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="website" 
              value={formData.website} 
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
            {isEditMode ? 'Update Shipping Line' : 'Create Shipping Line'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShippingLineForm;
