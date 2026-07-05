import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { businessService } from '../../../../../masters/services/business.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const CommodityForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    commodity_code: '',
    commodity_name: '',
    hs_code: '',
    description: '',
    hazardous: 'No',
    hazard_class: '',
    default_unit: '',
    status: 'Active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.commodity_name.trim() || !formData.commodity_code.trim()) {
      setError('Commodity Code and Name are required.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode) {
        await businessService.updateCommodity(initialData.id, formData);
      } else {
        await businessService.createCommodity(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save commodity');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Commodity' : 'Create New Commodity'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {error && <div className="alert alert-danger mb-md p-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="dense-form form-grid">
        <div className="form-group">
          <label>Commodity Code *</label>
          <input disabled={isLoading} required type="text" name="commodity_code" value={formData.commodity_code} onChange={handleChange} className="form-control form-control-sm uppercase" />
        </div>
        <div className="form-group">
          <label>Commodity Name *</label>
          <input disabled={isLoading} required type="text" name="commodity_name" value={formData.commodity_name} onChange={handleChange} className="form-control form-control-sm" />
        </div>
        <div className="form-group">
          <label>HS Code</label>
          <input disabled={isLoading} type="text" name="hs_code" value={formData.hs_code} onChange={handleChange} className="form-control form-control-sm" />
        </div>
        <div className="form-group">
          <label>Hazardous</label>
          <StatusToggle 
              value={formData.status} 
              onChange={(val) => handleChange({ target: { name: 'status', value: val } })}
              disabled={isLoading}
            />
          </div>
        
        <div className="form-actions flex justify-end gap-sm" style={{ gridColumn: '1 / -1' }}>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading}>
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommodityForm;
