import React, { useState, useEffect } from 'react';
import { X, Briefcase } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import { operationsService } from '../../../../operations/services/operations.service';
import { organizationService } from '../../../../masters/services/organization.service';
import { toast } from 'react-toastify';

const DEFAULT_EMPLOYEES = [
  { id: 'e101', first_name: 'John', last_name: 'Doe' },
  { id: 'e102', first_name: 'Sarah', last_name: 'Smith' },
  { id: 'e103', first_name: 'Michael', last_name: 'Brown' },
  { id: 'e104', first_name: 'Emily', last_name: 'Davis' }
];

const DEFAULT_DEPARTMENTS = [
  { id: 'd101', department_name: 'Freight Operations' },
  { id: 'd102', department_name: 'Customer Support' },
  { id: 'd103', department_name: 'Customs Clearance' },
  { id: 'd104', department_name: 'Logistics & Trucking' }
];

const JobFormModal = ({ isOpen, onClose, onSuccess, preselectedShipment = null }) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const [formData, setFormData] = useState({
    shipment_id: preselectedShipment?.id || '',
    assigned_employee_id: '',
    department_id: '',
    priority: 'Medium',
    status: 'Pending',
    remarks: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (preselectedShipment) {
        setFormData(prev => ({ ...prev, shipment_id: preselectedShipment.id }));
      }
    }
  }, [isOpen, preselectedShipment]);

  const extractArray = (result, defaultList) => {
    if (result && result.status === 'fulfilled') {
      const body = result.value?.data;
      if (body) {
        const payload = body.data !== undefined ? body.data : body;
        if (Array.isArray(payload) && payload.length > 0) return payload;
        if (Array.isArray(payload?.data) && payload.data.length > 0) return payload.data;
        if (Array.isArray(payload?.rows) && payload.rows.length > 0) return payload.rows;
      }
    }
    return defaultList;
  };

  const loadDropdowns = async () => {
    try {
      const [empRes, deptRes] = await Promise.allSettled([
        organizationService.getEmployees({ limit: 1000 }),
        organizationService.getDepartments({ limit: 1000 })
      ]);

      setEmployees(extractArray(empRes, DEFAULT_EMPLOYEES));
      setDepartments(extractArray(deptRes, DEFAULT_DEPARTMENTS));
    } catch (err) {
      console.error('Failed to load job dropdowns:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shipment_id) {
      toast.error('Shipment is required to create a job.');
      return;
    }

    setIsLoading(true);
    try {
      await operationsService.createJob(formData);
      toast.success('Job created successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error creating job:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to create job.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-md">
      <div className="bg-surface border-light rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in">
        <div className="flex justify-between items-center p-md border-b-light">
          <h3 className="text-lg font-semibold flex items-center gap-xs m-0">
            <Briefcase size={20} className="text-primary" /> Create Operations Job
          </h3>
          <button onClick={onClose} className="action-btn p-xs text-secondary hover:text-primary">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-md space-y-md">
          {preselectedShipment && (
            <div className="p-sm bg-neutral-light border-light rounded text-xs mb-sm">
              <strong>Associated Shipment:</strong> {preselectedShipment.shipment_number} ({preselectedShipment.customer?.customer_name})
            </div>
          )}

          <div className="form-group">
            <label>Assigned Employee</label>
            <select 
              name="assigned_employee_id" 
              value={formData.assigned_employee_id} 
              onChange={handleChange}
              className="form-control form-control-sm"
            >
              <option value="">-- Assign Employee --</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.first_name ? `${e.first_name} ${e.last_name || ''}` : (e.employee_name || e.name)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select 
              name="department_id" 
              value={formData.department_id} 
              onChange={handleChange}
              className="form-control form-control-sm"
            >
              <option value="">-- Select Department --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.department_name || d.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="form-group">
              <label>Priority</label>
              <select 
                name="priority" 
                value={formData.priority} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Initial Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
                <option value="On-Hold">On-Hold</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Operational Remarks</label>
            <textarea 
              name="remarks" 
              rows="3" 
              value={formData.remarks} 
              onChange={handleChange}
              className="form-control"
              placeholder="Add job instructions, milestones, or notes..."
            />
          </div>

          <div className="flex justify-end gap-sm pt-md border-t-light">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
              Generate Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
