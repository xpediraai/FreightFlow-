import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { foundationService } from '../../../../../masters/services/foundation.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const CityForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [countries, setCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  
  const [formData, setFormData] = useState({
    country_id: '',
    state_id: '',
    city_code: '',
    city_name: '',
    gst: '',
    pincode: '',
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
        country_id: initialData.country_id || '',
        state_id: initialData.state_id || '',
        city_code: initialData.city_code || '',
        city_name: initialData.city_name || '',
        gst: initialData.gst || '',
        pincode: initialData.pincode || '',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  // When country_id changes, filter states
  useEffect(() => {
    if (formData.country_id) {
      setFilteredStates(allStates.filter(s => s.country_id === formData.country_id));
    } else {
      setFilteredStates([]);
    }
  }, [formData.country_id, allStates]);

  const fetchParents = async () => {
    try {
      const [countriesRes, statesRes] = await Promise.all([
        foundationService.getCountries(),
        foundationService.getStates()
      ]);
      
      const extractArray = (data) => {
        if (data?.data?.data && Array.isArray(data.data.data)) return data.data.data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
      };

      setCountries(extractArray(countriesRes));
      setAllStates(extractArray(statesRes));
    } catch (err) {
      console.error('Failed to fetch parent data', err);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'country_id' && !value) error = 'Country is required';
    if (name === 'state_id' && !value) error = 'State is required';
    if (name === 'city_code' && !value.trim()) error = 'City Code is required';
    if (name === 'city_name' && !value.trim()) error = 'City Name is required';
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updates = { [name]: value };
    // Clear state if country changes
    if (name === 'country_id') {
      updates.state_id = '';
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
        await foundationService.updateCity(initialData.id, formData);
      } else {
        await foundationService.createCity(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} city`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit City' : 'Create New City'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Country <span className="text-danger">*</span></label>
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
            {isEditMode ? 'Update City' : 'Create City'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CityForm;
