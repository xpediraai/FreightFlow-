import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { organizationService } from '../../../../../masters/services/organization.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const EmployeeForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    employee_code: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    dob: '',
    doj: '',
    mobile: '',
    alternate_mobile: '',
    email: '',
    department_id: '',
    designation_id: '',
    country_id: '',
    state_id: '',
    city_id: '',
    address_line_1: '',
    address_line_2: '',
    pincode: '',
    aadhaar: '',
    pan: '',
    passport: '',
    reporting_manager: '',
    employment_type: '',
    blood_group: '',
    emergency_contact: '',
    status: 'Active'
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          organizationService.getDepartments(),
          organizationService.getDesignations()
        ]);
        
        let deptData = [];
        if (deptRes?.data?.data && Array.isArray(deptRes.data.data)) deptData = deptRes.data.data;
        else if (deptRes?.data && Array.isArray(deptRes.data)) deptData = deptRes.data;
        else if (Array.isArray(deptRes)) deptData = deptRes;
        
        let desigData = [];
        if (desigRes?.data?.data && Array.isArray(desigRes.data.data)) desigData = desigRes.data.data;
        else if (desigRes?.data && Array.isArray(desigRes.data)) desigData = desigRes.data;
        else if (Array.isArray(desigRes)) desigData = desigRes;

        setDepartments(deptData.filter(d => d.status === 'Active'));
        setDesignations(desigData.filter(d => d.status === 'Active'));
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        employee_code: initialData.employee_code || '',
        first_name: initialData.first_name || '',
        middle_name: initialData.middle_name || '',
        last_name: initialData.last_name || '',
        gender: initialData.gender || '',
        dob: formatDateForInput(initialData.dob),
        doj: formatDateForInput(initialData.doj),
        mobile: initialData.mobile || '',
        alternate_mobile: initialData.alternate_mobile || '',
        email: initialData.email || '',
        department_id: initialData.department_id || '',
        designation_id: initialData.designation_id || '',
        country_id: initialData.country_id || '',
        state_id: initialData.state_id || '',
        city_id: initialData.city_id || '',
        address_line_1: initialData.address_line_1 || '',
        address_line_2: initialData.address_line_2 || '',
        pincode: initialData.pincode || '',
        aadhaar: initialData.aadhaar || '',
        pan: initialData.pan || '',
        passport: initialData.passport || '',
        reporting_manager: initialData.reporting_manager || '',
        employment_type: initialData.employment_type || '',
        blood_group: initialData.blood_group || '',
        emergency_contact: initialData.emergency_contact || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'employee_code' && !String(value).trim()) error = 'Code is required';
    if (name === 'first_name' && !String(value).trim()) error = 'First Name is required';
    if (name === 'department_id' && !String(value).trim()) error = 'Department ID is required';
    if (name === 'designation_id' && !String(value).trim()) error = 'Designation ID is required';
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If department changes, clear the designation
    if (name === 'department_id') {
      setFormData(prev => ({ ...prev, [name]: value, designation_id: '' }));
      if (touched.department_id) {
        setErrors(prev => ({ ...prev, department_id: validateField('department_id', value) }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const filteredDesignations = designations.filter(d => 
    !formData.department_id || d.department_id === formData.department_id
  );

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
      if (!payload.dob) payload.dob = null;
      if (!payload.doj) payload.doj = null;

      if (isEditMode) {
        await organizationService.updateEmployee(initialData.id, payload);
      } else {
        await organizationService.createEmployee(payload);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} employee`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Employee' : 'Create New Employee'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Employee Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="employee_code" 
              value={formData.employee_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm uppercase" 
            />
            {errors.employee_code && <div className="text-danger text-xs mt-xs">{errors.employee_code}</div>}
          </div>
          <div className="form-group">
            <label>First Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="first_name" 
              value={formData.first_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.first_name && <div className="text-danger text-xs mt-xs">{errors.first_name}</div>}
          </div>
          <div className="form-group">
            <label>Middle Name</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="middle_name" 
              value={formData.middle_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="last_name" 
              value={formData.last_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
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
            {isEditMode ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
