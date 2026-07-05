import React, { useState } from 'react';
import { Building2, UserCircle, Mail, MapPin, Save, X } from 'lucide-react';
import Button from '../../../../shared/components/Button';
import { adminService } from '../../services/admin.service';

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
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isEditMode) {
        // Exclude owner details from update payload if they exist
        const { owner_name, owner_email, owner_password, owner_id, ...updatePayload } = formData;
        await adminService.updateCompany(initialData.id, updatePayload);
      } else {
        // 1. Create Owner via Register Route
        const ownerResponse = await adminService.createCompanyOwner({
          username: formData.owner_name,
          email: formData.owner_email,
          password: formData.owner_password,
          role: 'COMPANY_OWNER'
        });

        const newOwnerId = ownerResponse?.data?.user?.user_id || ownerResponse?.data?.user_id;

        // 2. Create Company and map Owner
        const { owner_name, owner_email, owner_password, ...companyPayload } = formData;
        companyPayload.owner_id = newOwnerId;
        
        await adminService.createCompany(companyPayload);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} company`);
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

      {error && <div className="alert alert-danger mb-md p-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="dense-form">
        <h4 className="section-title">Company Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Company Name <span className="text-danger">*</span></label>
            <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>Company Code <span className="text-danger">*</span></label>
            <input type="text" name="company_code" value={formData.company_code} onChange={handleChange} required className="form-control form-control-sm" disabled={isEditMode} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="company_email" value={formData.company_email} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-control form-control-sm" />
          </div>
        </div>

        <h4 className="section-title">Registration Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>PAN Card Number</label>
            <input type="text" name="pan_card_number" value={formData.pan_card_number} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>GST Number</label>
            <input type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>CHA Licence Number</label>
            <input type="text" name="cha_licence_number" value={formData.cha_licence_number} onChange={handleChange} className="form-control form-control-sm" />
          </div>
        </div>

        <h4 className="section-title">Banking Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Bank Name</label>
            <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input type="text" name="account_number" value={formData.account_number} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>IFSC Code</label>
            <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>Branch Name</label>
            <input type="text" name="branch_name" value={formData.branch_name} onChange={handleChange} className="form-control form-control-sm" />
          </div>
        </div>

        <h4 className="section-title">USD Banking Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>USD Bank</label>
            <input type="text" name="usd_bank" value={formData.usd_bank} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>USD Account Number</label>
            <input type="text" name="usd_account_number" value={formData.usd_account_number} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>USD IFSC / SWIFT Code</label>
            <input type="text" name="usd_ifsc_swift_code" value={formData.usd_ifsc_swift_code} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>USD Branch</label>
            <input type="text" name="usd_branch" value={formData.usd_branch} onChange={handleChange} className="form-control form-control-sm" />
          </div>
        </div>

        <h4 className="section-title">E-Invoice Credentials</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>E-Invoice Username</label>
            <input type="text" name="einvoice_username" value={formData.einvoice_username} onChange={handleChange} className="form-control form-control-sm" />
          </div>
          <div className="form-group">
            <label>E-Invoice Password</label>
            <input type="password" name="einvoice_password" value={formData.einvoice_password} onChange={handleChange} className="form-control form-control-sm" />
          </div>
        </div>

        {!isEditMode && (
          <>
            <h4 className="section-title">Owner Details</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name <span className="text-danger">*</span></label>
                <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} required className="form-control form-control-sm" placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email Address <span className="text-danger">*</span></label>
                <input type="email" name="owner_email" value={formData.owner_email} onChange={handleChange} required className="form-control form-control-sm" placeholder="john@acme.com" />
              </div>
              <div className="form-group">
                <label>Password <span className="text-danger">*</span></label>
                <input type="password" name="owner_password" value={formData.owner_password} onChange={handleChange} required className="form-control form-control-sm" placeholder="********" />
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
