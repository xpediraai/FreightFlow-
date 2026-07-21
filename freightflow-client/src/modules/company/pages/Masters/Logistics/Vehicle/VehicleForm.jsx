import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { logisticsService } from '../../../../../masters/services/logistics.service';
import { businessService } from '../../../../../masters/services/business.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const VehicleForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [vendors, setVendors] = useState([]);
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: '',
    vehicle_capacity: '',
    vehicle_owner: '',
    vendor_id: '',
    registration_number: '',
    registration_expiry: '',
    insurance_number: '',
    insurance_expiry: '',
    fitness_expiry: '',
    pollution_expiry: '',
    gps_enabled: 'No',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchVendors();
    if (initialData) {
      setFormData({
        vehicle_number: initialData.vehicle_number || '',
        vehicle_type: initialData.vehicle_type || '',
        vehicle_capacity: initialData.vehicle_capacity || '',
        vehicle_owner: initialData.vehicle_owner || '',
        vendor_id: initialData.vendor_id || '',
        registration_number: initialData.registration_number || '',
        registration_expiry: formatDateForInput(initialData.registration_expiry),
        insurance_number: initialData.insurance_number || '',
        insurance_expiry: formatDateForInput(initialData.insurance_expiry),
        fitness_expiry: formatDateForInput(initialData.fitness_expiry),
        pollution_expiry: formatDateForInput(initialData.pollution_expiry),
        gps_enabled: initialData.gps_enabled || 'No',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const fetchVendors = async () => {
    try {
      const res = await businessService.getVendors({ page: 1, limit: 10000 });
      let data = [];
      if (res?.data?.data?.data && Array.isArray(res.data.data.data)) {
        data = res.data.data.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (Array.isArray(res)) {
        data = res;
      }
      setVendors(data);
    } catch (err) {
      console.error('Failed to fetch vendors for vehicle form', err);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'vehicle_number' && !String(value).trim()) error = 'Vehicle Number is required';
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
      
      // Nullify empty date strings for Sequelize
      const dateFields = ['registration_expiry', 'insurance_expiry', 'fitness_expiry', 'pollution_expiry'];
      dateFields.forEach(field => {
        if (!payload[field]) payload[field] = null;
      });

      if (isEditMode) {
        await logisticsService.updateVehicle(initialData.id, payload);
      } else {
        await logisticsService.createVehicle(payload);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} vehicle`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center border-b-light pb-sm mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Vehicle' : 'Create New Vehicle'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Vehicle Number <span className="text-danger">*</span></label>
            <input 
              disabled={isLoading || isEditMode} 
              type="text" 
              name="vehicle_number" 
              value={formData.vehicle_number} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm uppercase" 
            />
            {errors.vehicle_number && <div className="text-danger text-xs mt-xs">{errors.vehicle_number}</div>}
          </div>
          <div className="form-group">
            <label>Vehicle Type</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="vehicle_type" 
              value={formData.vehicle_type} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Capacity (kg/tons)</label>
            <input 
              disabled={isLoading} 
              type="number" 
              step="0.01"
              name="vehicle_capacity" 
              value={formData.vehicle_capacity} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Vehicle Owner</label>
            <input 
              disabled={isLoading} 
              type="text" 
              name="vehicle_owner" 
              value={formData.vehicle_owner} 
              onChange={handleChange} 
              onBlur={handleBlur}
              className="form-control form-control-sm" 
            />
          </div>
          <div className="form-group">
            <label>Vendor</label>
            <select
              disabled={isLoading}
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-control form-control-sm"
            >
              <option value="">Select Vendor</option>
              {vendors
                .filter(v => v.status === 'Active' || v.id === formData.vendor_id)
                .map(v => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_name} ({v.vendor_code})
                  </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>GPS Enabled</label>
            <select
              disabled={isLoading}
              name="gps_enabled"
              value={formData.gps_enabled}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-control form-control-sm"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
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
            {isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
