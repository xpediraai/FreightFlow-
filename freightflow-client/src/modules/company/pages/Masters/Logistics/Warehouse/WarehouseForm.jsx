import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { logisticsService } from '../../../../../masters/services/logistics.service';
import { foundationService } from '../../../../../masters/services/foundation.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const WarehouseForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [countries, setCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  const [formData, setFormData] = useState({
    warehouse_code: '',
    warehouse_name: '',
    warehouse_type: '',
    country_id: '',
    state_id: '',
    city_id: '',
    address: '',
    pincode: '',
    contact_person: '',
    mobile: '',
    email: '',
    capacity: '',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchParents();
    if (initialData) {
      setFormData({
        warehouse_code: initialData.warehouse_code || '',
        warehouse_name: initialData.warehouse_name || '',
        warehouse_type: initialData.warehouse_type || '',
        country_id: initialData.country_id || '',
        state_id: initialData.state_id || '',
        city_id: initialData.city_id || '',
        address: initialData.address || '',
        pincode: initialData.pincode || '',
        contact_person: initialData.contact_person || '',
        mobile: initialData.mobile || '',
        email: initialData.email || '',
        capacity: initialData.capacity || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

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

  const fetchParents = async () => {
    try {
      const [countriesRes, statesRes, citiesRes] = await Promise.all([
        foundationService.getCountries({ page: 1, limit: 10000 }),
        foundationService.getStates({ page: 1, limit: 10000 }),
        foundationService.getCities({ page: 1, limit: 10000 })
      ]);
      
      const extractArray = (data) => {
        if (data?.data?.data && Array.isArray(data.data.data)) return data.data.data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
      };

      setCountries(extractArray(countriesRes));
      setAllStates(extractArray(statesRes));
      setAllCities(extractArray(citiesRes));
    } catch (err) {
      console.error('Failed to fetch parents for warehouse form', err);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'warehouse_code' && !String(value).trim()) error = 'Warehouse Code is required';
    if (name === 'warehouse_name' && !String(value).trim()) error = 'Warehouse Name is required';
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updates = { [name]: value };
    if (name === 'country_id') {
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
        await logisticsService.updateWarehouse(initialData.id, formData);
      } else {
        await logisticsService.createWarehouse(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} warehouse`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Warehouse' : 'Create New Warehouse'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Warehouse Code <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="warehouse_code" 
              value={formData.warehouse_code} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.warehouse_code && <div className="text-danger text-xs mt-xs">{errors.warehouse_code}</div>}
          </div>
          <div className="form-group">
            <label>Warehouse Name <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="warehouse_name" 
              value={formData.warehouse_name} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
            {errors.warehouse_name && <div className="text-danger text-xs mt-xs">{errors.warehouse_name}</div>}
          </div>
          <div className="form-group">
            <label>Warehouse Type</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="warehouse_type" 
              value={formData.warehouse_type} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input 
              disabled={isLoading} 
              type="number" 
              step="0.01"
              name="capacity" 
              value={formData.capacity} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
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
            {isEditMode ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WarehouseForm;
