import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { commonService } from '../../../../../masters/services/common.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const UOMForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    uom_code: '',
    uom_name: '',
    symbol: '',
    description: '',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        uom_code: initialData.uom_code || '',
        uom_name: initialData.uom_name || '',
        symbol: initialData.symbol || '',
        description: initialData.description || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'uom_code' && !String(value).trim()) error = 'UOM Code is required';
    if (name === 'uom_name' && !String(value).trim()) error = 'UOM Name is required';
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
        await commonService.updateUOM(initialData.id, formData);
      } else {
        await commonService.createUOM(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} UOM`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit UOM' : 'Create New UOM'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>UOM Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="uom_code" 
              value={formData.uom_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.uom_code && <div className="text-danger text-xs mt-xs">{errors.uom_code}</div>}
          </div>
          <div className="form-group">
            <label>UOM Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="uom_name" 
              value={formData.uom_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.uom_name && <div className="text-danger text-xs mt-xs">{errors.uom_name}</div>}
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
            <label>Description</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="description" 
              value={formData.description} 
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
            {isEditMode ? 'Update UOM' : 'Create UOM'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UOMForm;
