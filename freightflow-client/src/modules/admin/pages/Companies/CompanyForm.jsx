import React, { useState } from 'react';
import { Building2, UserCircle, Mail, MapPin, Save, X } from 'lucide-react';
import Button from '../../../../shared/components/Button';
import { adminService } from '../../services/admin.service';
import StatusToggle from '../../../../shared/components/Input/StatusToggle';

const CompanyForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState(initialData || {
    company_name: '',
    company_code: '',
    address: '',
    city: '',
    contact_number: '',
    company_email: '',
    pan_card_number: '',
    gst_number: '',
    cha_licence_number: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    usd_bank: '',
    usd_account_number: '',
    usd_ifsc_swift_code: '',
    usd_branch: '',
    einvoice_username: '',
    einvoice_password: '',
    // Owner details (only for create)
    owner_name: '',
    owner_email: '',
    owner_password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = '';
    if (name === 'company_name' && !value.trim()) error = 'Company Name is required';
    if (name === 'company_code' && !value.trim()) error = 'Company Code is required';
    if (!isEditMode) {
      if (name === 'owner_name' && !value.trim()) error = 'Owner Full Name is required';
      if (name === 'owner_email') {
        if (!value.trim()) error = 'Owner Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
      }
      if (name === 'owner_password' && !value.trim()) error = 'Owner Password is required';
    }
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
    
    // Validate all required fields
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
        const { owner_name, owner_email, owner_password, owner_id, ...updatePayload } = formData;
        await adminService.updateCompany(initialData.id, updatePayload);
      } else {
        const ownerResponse = await adminService.createCompanyOwner({
          full_name: formData.owner_name,
          email: formData.owner_email,
          password: formData.owner_password,
          role: 'COMPANY_OWNER'
        });

        const newOwnerId = ownerResponse?.data?.id || ownerResponse?.data?.user?.user_id || ownerResponse?.data?.user_id;

        const { owner_name, owner_email, owner_password, ...companyPayload } = formData;
        companyPayload.owner_id = newOwnerId;
        
        await adminService.createCompany(companyPayload);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} company`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="company-form-container bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="form-header mb-md flex justify-between align-center border-b-light pb-sm">
        <div>
          <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Company' : 'Create New Company'}</h2>
        </div>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <h4 className="section-title">Company Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Company Name <span className="text-danger">*</span></label>
            <input disabled={isLoading} type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="form-control form-control-sm" onBlur={handleBlur} />
            {errors.company_name && <div className="text-danger" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.company_name}</div>}
          </div>
          <div className="form-group">
            <label>Company Code <span className="text-danger">*</span></label>
            <input disabled={isLoading} type="text" name="company_code" value={formData.company_code} onChange={handleChange} required className="form-control form-control-sm" disabled={isEditMode} onBlur={handleBlur} />
            {errors.company_code && <div className="text-danger" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.company_code}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input disabled={isLoading} type="email" name="company_email" value={formData.company_email} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input disabled={isLoading} type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input disabled={isLoading} type="text" name="address" value={formData.address} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>City</label>
            <input disabled={isLoading} type="text" name="city" value={formData.city} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
        </div>

        <h4 className="section-title">Registration Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>PAN Card Number</label>
            <input disabled={isLoading} type="text" name="pan_card_number" value={formData.pan_card_number} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>GST Number</label>
            <input disabled={isLoading} type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>CHA Licence Number</label>
            <input disabled={isLoading} type="text" name="cha_licence_number" value={formData.cha_licence_number} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
        </div>

        <h4 className="section-title">Banking Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Bank Name</label>
            <input disabled={isLoading} type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input disabled={isLoading} type="text" name="account_number" value={formData.account_number} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>IFSC Code</label>
            <input disabled={isLoading} type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>Branch Name</label>
            <input disabled={isLoading} type="text" name="branch_name" value={formData.branch_name} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
        </div>

        <h4 className="section-title">USD Banking Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>USD Bank</label>
            <input disabled={isLoading} type="text" name="usd_bank" value={formData.usd_bank} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>USD Account Number</label>
            <input disabled={isLoading} type="text" name="usd_account_number" value={formData.usd_account_number} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>USD IFSC / SWIFT Code</label>
            <input disabled={isLoading} type="text" name="usd_ifsc_swift_code" value={formData.usd_ifsc_swift_code} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>USD Branch</label>
            <input disabled={isLoading} type="text" name="usd_branch" value={formData.usd_branch} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
        </div>

        <h4 className="section-title">E-Invoice Credentials</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>E-Invoice Username</label>
            <input disabled={isLoading} type="text" name="einvoice_username" value={formData.einvoice_username} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
          <div className="form-group">
            <label>E-Invoice Password</label>
            <input disabled={isLoading} type="password" name="einvoice_password" value={formData.einvoice_password} onChange={handleChange} className="form-control form-control-sm" onBlur={handleBlur} />
          </div>
        </div>

        {!isEditMode && (
          <>
            <h4 className="section-title">Owner Details</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name <span className="text-danger">*</span></label>
                <input disabled={isLoading} type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} required className="form-control form-control-sm" placeholder="John Doe" onBlur={handleBlur} />
            {errors.owner_name && <div className="text-danger" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.owner_name}</div>}
              </div>
              <div className="form-group">
                <label>Email Address <span className="text-danger">*</span></label>
                <input disabled={isLoading} type="email" name="owner_email" value={formData.owner_email} onChange={handleChange} required className="form-control form-control-sm" placeholder="john@acme.com" onBlur={handleBlur} />
            {errors.owner_email && <div className="text-danger" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.owner_email}</div>}
              </div>
              <div className="form-group">
                <label>Password <span className="text-danger">*</span></label>
                <input disabled={isLoading} type="password" name="owner_password" value={formData.owner_password} onChange={handleChange} required className="form-control form-control-sm" placeholder="********" onBlur={handleBlur} />
            {errors.owner_password && <div className="text-danger" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.owner_password}</div>}
              </div>
            </div>
          </>
        )}

        <div className="form-actions flex justify-end gap-sm mt-lg pt-md border-t-light bg-surface" style={{ position: 'sticky', bottom: 0 }}>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading} size="sm">
            Cancel
          </Button>
          <Button variant="primary" type="submit" leftIcon={Save} isLoading={isLoading} size="sm">
            {isEditMode ? 'Save Changes' : 'Create Company'}
          </Button>
        </div>
      </form>

      <style>{`
        .company-form-container {
          max-height: calc(100vh - 180px);
          overflow-y: auto;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem 1.5rem;
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-primary);
          margin: 1.5rem 0 0.75rem 0;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid var(--color-border);
        }
        .dense-form .form-group {
          margin-bottom: 0;
        }
        .dense-form label {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          margin-bottom: 0.25rem;
          display: block;
        }
        .form-control-sm {
          padding: 0.4rem 0.6rem;
          font-size: 0.85rem;
          height: auto;
        }
        @media (max-width: 1200px) {
          .form-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default CompanyForm;
