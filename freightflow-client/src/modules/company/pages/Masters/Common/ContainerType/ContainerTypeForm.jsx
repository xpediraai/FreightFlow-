import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { commonService } from '../../../../../masters/services/common.service';

const ContainerTypeForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    container_code: '',
    container_name: '',
    iso_code: '',
    size: '20',
    category: 'Dry',
    capacity_cbm: '',
    max_weight: '',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        container_code: initialData.container_code || '',
        container_name: initialData.container_name || '',
        iso_code: initialData.iso_code || '',
        size: initialData.size || '20',
        category: initialData.category || 'Dry',
        capacity_cbm: initialData.capacity_cbm || '',
        max_weight: initialData.max_weight || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'container_code' && !String(value).trim()) error = 'Container Code is required';
    if (name === 'container_name' && !String(value).trim()) error = 'Container Name is required';
    if (name === 'iso_code' && !String(value).trim()) error = 'ISO Code is required';
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
        await commonService.updateContainerType(initialData.id, formData);
      } else {
        await commonService.createContainerType(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} container type`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Container Type' : 'Create New Container Type'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Container Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="container_code" 
              value={formData.container_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.container_code && <div className="text-danger text-xs mt-xs">{errors.container_code}</div>}
          </div>
          <div className="form-group">
            <label>Container Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="container_name" 
              value={formData.container_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.container_name && <div className="text-danger text-xs mt-xs">{errors.container_name}</div>}
          </div>
          <div className="form-group">
            <label>ISO Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="iso_code" 
              value={formData.iso_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.iso_code && <div className="text-danger text-xs mt-xs">{errors.iso_code}</div>}
          </div>
          <div className="form-group">
            <label>Size <span className="text-danger">*</span></label>
            <select 
              disabled={isLoading} 
              name="size" 
              value={formData.size} 
              onChange={handleChange} 
              className="form-control form-control-sm"
            >
              <option value="20">20'</option>
              <option value="40">40'</option>
              <option value="45">45'</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category <span className="text-danger">*</span></label>
            <select 
              disabled={isLoading} 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className="form-control form-control-sm"
            >
              <option value="Dry">Dry</option>
              <option value="Reefer">Reefer</option>
              <option value="Open Top">Open Top</option>
              <option value="Flat Rack">Flat Rack</option>
              <option value="Tank">Tank</option>
            </select>
          </div>
          <div className="form-group">
            <label>Capacity (CBM)</label>
            <input 
              disabled={isLoading} 
              type="number" 
              step="0.01"
              name="capacity_cbm" 
              value={formData.capacity_cbm} 
              onChange={handleChange} 
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Max Weight (kg)</label>
            <input 
              disabled={isLoading} 
              type="number" 
              step="0.01"
              name="max_weight" 
              value={formData.max_weight} 
              onChange={handleChange} 
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
            {isEditMode ? 'Update Container Type' : 'Create Container Type'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContainerTypeForm;
