import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { organizationService } from '../../../../../masters/services/organization.service';
import { foundationService } from '../../../../../masters/services/foundation.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const EmployeeForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [countries, setCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

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
        const [deptRes, desigRes, countriesRes, statesRes, citiesRes] = await Promise.all([
          organizationService.getDepartments(),
          organizationService.getDesignations(),
          foundationService.getCountries({ page: 1, limit: 10000 }),
          foundationService.getStates({ page: 1, limit: 10000 }),
          foundationService.getCities({ page: 1, limit: 10000 })
        ]);
        
        let deptData = [];
        if (deptRes?.data?.data && Array.isArray(deptRes.data.data)) deptData = deptRes.data.data;
        else if (deptRes?.data && Array.isArray(deptRes.data)) deptData = deptRes.data;
        else if (Array.isArray(deptRes)) deptData = deptRes;
        
        let desigData = [];
        if (desigRes?.data?.data && Array.isArray(desigRes.data.data)) desigData = desigRes.data.data;
        else if (desigRes?.data && Array.isArray(desigRes.data)) desigData = desigRes.data;
        else if (Array.isArray(desigRes)) desigData = desigRes;

        const extractArray = (data) => {
          if (data?.data?.data && Array.isArray(data.data.data)) return data.data.data;
          if (data?.data && Array.isArray(data.data)) return data.data;
          if (Array.isArray(data)) return data;
          return [];
        };

        setDepartments(deptData);
        setDesignations(desigData);
        setCountries(extractArray(countriesRes));
        setAllStates(extractArray(statesRes));
        setAllCities(extractArray(citiesRes));
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (formData.country_id) {
      setFilteredStates(allStates.filter(s => s.country_id === formData.country_id));
    } else {
      setFilteredStates([]);
    }
  }, [formData.country_id, allStates]);

  useEffect(() => {
    if (formData.state_id) {
      setFilteredCities(allCities.filter(c => c.state_id === formData.state_id));
    } else {
      setFilteredCities([]);
    }
  }, [formData.state_id, allCities]);

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
    const updates = { [name]: value };
    
    if (name === 'department_id') {
      updates.designation_id = '';
    } else if (name === 'country_id') {
      updates.state_id = '';
      updates.city_id = '';
    } else if (name === 'state_id') {
      updates.city_id = '';
    }

    setFormData(prev => ({ ...prev, ...updates }));
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
      if (!payload.country_id) payload.country_id = null;
      if (!payload.state_id) payload.state_id = null;
      if (!payload.city_id) payload.city_id = null;
      if (!payload.reporting_manager) payload.reporting_manager = null;

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
          {/* Personal Info */}
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
            <label>Gender</label>
            <select
              disabled={isLoading}
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-control form-control-sm"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input 
              disabled={isLoading} 
              type="date" 
              name="dob" 
              value={formData.dob} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>

          <div className="form-group">
            <label>Blood Group</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="blood_group" 
              value={formData.blood_group} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
              placeholder="e.g. O+, A+"
            />
          </div>

          {/* Employment Info */}
          <div className="form-group">
            <label>Department <span className="text-danger">*</span></label>
            <select
              disabled={isLoading}
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-control form-control-sm"
            >
              <option value="">Select Department</option>
              {departments
                .filter(d => d.status === 'Active' || d.id === formData.department_id)
                .map(d => (
                  <option key={d.id} value={d.id}>{d.department_name}</option>
              ))}
            </select>
            {errors.department_id && <div className="text-danger text-xs mt-xs">{errors.department_id}</div>}
          </div>

          <div className="form-group">
            <label>Designation <span className="text-danger">*</span></label>
            <select
              disabled={isLoading}
              name="designation_id"
              value={formData.designation_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-control form-control-sm"
            >
              <option value="">Select Designation</option>
              {filteredDesignations
                .filter(d => d.status === 'Active' || d.id === formData.designation_id)
                .map(d => (
                  <option key={d.id} value={d.id}>{d.designation_name}</option>
              ))}
            </select>
            {errors.designation_id && <div className="text-danger text-xs mt-xs">{errors.designation_id}</div>}
          </div>

          <div className="form-group">
            <label>Employment Type</label>
            <select
              disabled={isLoading}
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-control form-control-sm"
            >
              <option value="">Select Type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contractor">Contractor</option>
              <option value="Intern">Intern</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Joining</label>
            <input 
              disabled={isLoading} 
              type="date" 
              name="doj" 
              value={formData.doj} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>

          <div className="form-group">
            <label>Reporting Manager</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="reporting_manager" 
              value={formData.reporting_manager} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>

          {/* Contact Details */}
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

          {/* Address Details */}
          <div className="form-group">
            <label>Address Line 1</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="address_line_1" 
              value={formData.address_line_1} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>

          <div className="form-group">
            <label>Address Line 2</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="address_line_2" 
              value={formData.address_line_2} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>

          <div className="form-group">
            <label>Pincode</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="pincode" 
              value={formData.pincode} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>

          <div className="form-group">
            <label>Country</label>
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
                .filter(c => c.status === 'Active' || c.id === formData.country_id)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.country_name} ({c.country_code})
                  </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>State</label>
            <select
              disabled={isLoading || !formData.country_id}
              name="state_id"
              value={formData.state_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-control form-control-sm"
            >
              <option value="">Select State</option>
              {filteredStates
                .filter(s => s.status === 'Active' || s.id === formData.state_id)
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.state_name} ({s.state_code})
                  </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>City</label>
            <select
              disabled={isLoading || !formData.state_id}
              name="city_id"
              value={formData.city_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-control form-control-sm"
            >
              <option value="">Select City</option>
              {filteredCities
                .filter(c => c.status === 'Active' || c.id === formData.city_id)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.city_name}
                  </option>
              ))}
            </select>
          </div>

          {/* Identity Details */}
          <div className="form-group">
            <label>Aadhaar Number</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="aadhaar" 
              value={formData.aadhaar} 
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
              name="pan" 
              value={formData.pan} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm uppercase" 
            />
          </div>

          <div className="form-group">
            <label>Passport Number</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="passport" 
              value={formData.passport} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm uppercase" 
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="emergency_contact" 
              value={formData.emergency_contact} 
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
            {isEditMode ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
