import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { organizationService } from '../../../../../masters/services/organization.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const DesignationForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    designation_code: '',
    designation_name: '',
    department_id: '',
    description: '',
    status: 'Active'
  });

  const [departments, setDepartments] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const deptRes = await organizationService.getDepartments();
        
        let deptData = [];
        if (deptRes?.data?.data && Array.isArray(deptRes.data.data)) deptData = deptRes.data.data;
        else if (deptRes?.data && Array.isArray(deptRes.data)) deptData = deptRes.data;
        else if (Array.isArray(deptRes)) deptData = deptRes;
        
        setDepartments(deptData.filter(d => d.status === 'Active'));
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        designation_code: initialData.designation_code || '',
        designation_name: initialData.designation_name || '',
        department_id: initialData.department_id || '',
        description: initialData.description || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'designation_code' && !String(value).trim()) error = 'Designation Code is required';
    if (name === 'designation_name' && !String(value).trim()) error = 'Designation Name is required';
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
        await organizationService.updateDesignation(initialData.id, formData);
      } else {
        await organizationService.createDesignation(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} designation`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Designation' : 'Create New Designation'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Designation Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="designation_code" 
              value={formData.designation_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm uppercase" 
            />
            {errors.designation_code && <div className="text-danger text-xs mt-xs">{errors.designation_code}</div>}
          </div>
          <div className="form-group">
            <label>Designation Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="designation_name" 
              value={formData.designation_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.designation_name && <div className="text-danger text-xs mt-xs">{errors.designation_name}</div>}
          </div>
          <div className="form-group">
            <label>Department <span className="text-danger">*</span></label>
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
            {isEditMode ? 'Update Designation' : 'Create Designation'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DesignationForm;
