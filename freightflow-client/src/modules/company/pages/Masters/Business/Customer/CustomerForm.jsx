import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { businessService } from '../../../../../masters/services/business.service';
import { foundationService } from '../../../../../masters/services/foundation.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const TABS = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'address', label: 'Address' },
  { id: 'bank', label: 'Bank Details' },
  { id: 'contact_docs', label: 'Contact Info & Documents' }
];

const CustomerForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  // State matching backend Joi validator
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_type: '',
    customer_category: '',
    gst_number: '',
    pan_number: '',
    iec_code: '',
    cin_number: '',
    tan_number: '',
    credit_limit: '',
    payment_terms: '',
    currency_id: '',
    status: 'Active',
    
    // Arrays
    addresses: [],
    banks: [],
    contacts: [],
    documents: []
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [currRes, countRes, stateRes, cityRes] = await Promise.all([
          foundationService.getCurrencies(),
          foundationService.getCountries(),
          foundationService.getStates(),
          foundationService.getCities()
        ]);
        
        const extractData = (res) => {
          if (res?.data?.data?.data && Array.isArray(res.data.data.data)) return res.data.data.data;
          if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
          if (res?.data && Array.isArray(res.data)) return res.data;
          if (Array.isArray(res)) return res;
          return [];
        };

        setCurrencies(extractData(currRes).filter(c => c.status === 'Active'));
        setCountries(extractData(countRes).filter(c => c.status === 'Active'));
        setStates(extractData(stateRes));
        setCities(extractData(cityRes));
      } catch (err) {
        console.error('Failed to fetch dropdowns:', err);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData, // defaults
        ...initialData,
        addresses: initialData.addresses || [],
        banks: initialData.banks || [],
        contacts: initialData.contacts || [],
        documents: initialData.documents || []
      });
    }
  }, [initialData]);

  // --- Handlers ---
  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...formData[arrayName]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    
    // Set a temporary uploading state if needed, here we'll just block submit with isLoading
    setIsLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('document', file);
      
      const res = await businessService.uploadDocument(uploadData);
      if (res.data?.data?.file_url) {
        handleArrayChange('documents', index, 'file_url', res.data.data.file_url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setGlobalError('File upload failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const addArrayItem = (arrayName, emptyItem) => {
    setFormData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], emptyItem] }));
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = [...formData[arrayName]];
    newArray.splice(index, 1);
    setFormData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    
    if (!formData.customer_name.trim()) {
      setGlobalError('Customer Name is required in Personal Info tab.');
      setActiveTab('personal');
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = { ...formData };
      if (!payload.credit_limit) payload.credit_limit = null; // Fix number parsing
      if (!payload.currency_id) payload.currency_id = null;

      // Clean up empty UUIDs inside array items to be null
      payload.addresses = (payload.addresses || []).map(addr => ({
        ...addr,
        country_id: addr.country_id || null,
        state_id: addr.state_id || null,
        city_id: addr.city_id || null
      }));

      if (isEditMode) {
        await businessService.updateCustomer(initialData.id, payload);
      } else {
        await businessService.createCustomer(payload);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setGlobalError(err.response?.data?.message || err.message || `Failed to ${isEditMode ? 'update' : 'create'} customer`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renders ---
  const renderPersonalInfo = () => (
    <div className="form-grid pt-md">
      <div className="form-group">
        <label>Customer Name <span className="text-danger">*</span></label>
        <input disabled={isLoading} required type="text" name="customer_name" value={formData.customer_name} onChange={handleMainChange} className="form-control form-control-sm" />
      </div>
      <div className="form-group">
        <label>Customer Type</label>
        <select disabled={isLoading} name="customer_type" value={formData.customer_type || ''} onChange={handleMainChange} className="form-control form-control-sm">
          <option value="">Select Type...</option>
          <option value="Exporter">Exporter</option>
          <option value="Importer">Importer</option>
          <option value="Agent">Agent</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label>Customer Category</label>
        <input disabled={isLoading} type="text" name="customer_category" value={formData.customer_category || ''} onChange={handleMainChange} className="form-control form-control-sm" placeholder="e.g. Premium, Regular" />
      </div>
      <div className="form-group">
        <label>GST Number</label>
        <input disabled={isLoading} type="text" name="gst_number" value={formData.gst_number || ''} onChange={handleMainChange} className="form-control form-control-sm uppercase" />
      </div>
      <div className="form-group">
        <label>PAN Number</label>
        <input disabled={isLoading} type="text" name="pan_number" value={formData.pan_number || ''} onChange={handleMainChange} className="form-control form-control-sm uppercase" />
      </div>
      <div className="form-group">
        <label>IEC Code</label>
        <input disabled={isLoading} type="text" name="iec_code" value={formData.iec_code || ''} onChange={handleMainChange} className="form-control form-control-sm uppercase" />
      </div>
      <div className="form-group">
        <label>CIN Number</label>
        <input disabled={isLoading} type="text" name="cin_number" value={formData.cin_number || ''} onChange={handleMainChange} className="form-control form-control-sm uppercase" />
      </div>
      <div className="form-group">
        <label>TAN Number</label>
        <input disabled={isLoading} type="text" name="tan_number" value={formData.tan_number || ''} onChange={handleMainChange} className="form-control form-control-sm uppercase" />
      </div>
      <div className="form-group">
        <label>Credit Limit</label>
        <input disabled={isLoading} type="number" step="0.01" name="credit_limit" value={formData.credit_limit || ''} onChange={handleMainChange} className="form-control form-control-sm" />
      </div>
      <div className="form-group">
        <label>Payment Terms</label>
        <input disabled={isLoading} type="text" name="payment_terms" value={formData.payment_terms || ''} onChange={handleMainChange} className="form-control form-control-sm" placeholder="e.g. Net 30, COD" />
      </div>
      <div className="form-group">
        <label>Currency</label>
        <select disabled={isLoading} name="currency_id" value={formData.currency_id || ''} onChange={handleMainChange} className="form-control form-control-sm">
          <option value="">Select Currency...</option>
          {currencies.map(c => (
            <option key={c.id} value={c.id}>{c.currency_code} ({c.currency_name})</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Status</label>
        <StatusToggle 
          value={formData.status} 
          onChange={(val) => handleMainChange({ target: { name: 'status', value: val } })}
          disabled={isLoading}
        />
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="pt-md">
      <div className="flex justify-end mb-sm">
        <Button type="button" size="sm" variant="outline" leftIcon={Plus} onClick={() => addArrayItem('addresses', { address_type: 'Billing', address_line_1: '', address_line_2: '', pincode: '', country_id: null, state_id: null, city_id: null })}>Add Address</Button>
      </div>
      {formData.addresses.length === 0 && <div className="text-center p-md text-tertiary">No addresses added yet.</div>}
      {formData.addresses.map((addr, index) => (
        <div key={index} className="bg-surface-hover p-sm rounded border-light mb-sm relative">
          <button type="button" className="absolute top-2 right-2 text-danger hover:bg-danger-light p-xs rounded" onClick={() => removeArrayItem('addresses', index)}><Trash2 size={16}/></button>
          <h4 className="m-0 mb-sm text-sm">Address {index + 1}</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Address Type</label>
              <select className="form-control form-control-sm" value={addr.address_type} onChange={(e) => handleArrayChange('addresses', index, 'address_type', e.target.value)}>
                <option value="Billing">Billing</option>
                <option value="Shipping">Shipping</option>
                <option value="Registered">Registered</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address Line 1</label>
              <input type="text" className="form-control form-control-sm" value={addr.address_line_1} onChange={(e) => handleArrayChange('addresses', index, 'address_line_1', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input type="text" className="form-control form-control-sm" value={addr.pincode} onChange={(e) => handleArrayChange('addresses', index, 'pincode', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Country</label>
              <select 
                className="form-control form-control-sm" 
                value={addr.country_id || ''} 
                onChange={(e) => {
                  const val = e.target.value || null;
                  handleArrayChange('addresses', index, 'country_id', val);
                  handleArrayChange('addresses', index, 'state_id', null);
                  handleArrayChange('addresses', index, 'city_id', null);
                }}
              >
                <option value="">Select Country...</option>
                {countries
                  .filter(c => c.status === 'Active' || c.id === addr.country_id)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.country_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>State</label>
              <select 
                className="form-control form-control-sm" 
                value={addr.state_id || ''} 
                onChange={(e) => {
                  const val = e.target.value || null;
                  handleArrayChange('addresses', index, 'state_id', val);
                  handleArrayChange('addresses', index, 'city_id', null);
                }}
                disabled={!addr.country_id}
              >
                <option value="">Select State...</option>
                {states
                  .filter(s => s.country_id === addr.country_id)
                  .filter(s => s.status === 'Active' || s.id === addr.state_id)
                  .map(s => (
                    <option key={s.id} value={s.id}>{s.state_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>City</label>
              <select 
                className="form-control form-control-sm" 
                value={addr.city_id || ''} 
                onChange={(e) => {
                  const val = e.target.value || null;
                  handleArrayChange('addresses', index, 'city_id', val);
                }}
                disabled={!addr.state_id}
              >
                <option value="">Select City...</option>
                {cities
                  .filter(c => c.state_id === addr.state_id)
                  .filter(c => c.status === 'Active' || c.id === addr.city_id)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.city_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBankDetails = () => (
    <div className="pt-md">
      <div className="flex justify-end mb-sm">
        <Button type="button" size="sm" variant="outline" leftIcon={Plus} onClick={() => addArrayItem('banks', { bank_name: '', branch: '', account_holder: '', account_number: '', ifsc_code: '', swift_code: '' })}>Add Bank</Button>
      </div>
      {formData.banks.length === 0 && <div className="text-center p-md text-tertiary">No bank details added yet.</div>}
      {formData.banks.map((bank, index) => (
        <div key={index} className="bg-surface-hover p-sm rounded border-light mb-sm relative">
          <button type="button" className="absolute top-2 right-2 text-danger hover:bg-danger-light p-xs rounded" onClick={() => removeArrayItem('banks', index)}><Trash2 size={16}/></button>
          <h4 className="m-0 mb-sm text-sm">Bank {index + 1}</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Bank Name *</label>
              <input type="text" className="form-control form-control-sm" required value={bank.bank_name} onChange={(e) => handleArrayChange('banks', index, 'bank_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input type="text" className="form-control form-control-sm" value={bank.account_number} onChange={(e) => handleArrayChange('banks', index, 'account_number', e.target.value)} />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input type="text" className="form-control form-control-sm uppercase" value={bank.ifsc_code} onChange={(e) => handleArrayChange('banks', index, 'ifsc_code', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Swift Code</label>
              <input type="text" className="form-control form-control-sm uppercase" value={bank.swift_code} onChange={(e) => handleArrayChange('banks', index, 'swift_code', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContactDocs = () => (
    <div className="pt-md">
      <h3 className="text-md font-semibold mb-sm">Contacts</h3>
      <div className="flex justify-end mb-sm mt-[-40px]">
        <Button type="button" size="sm" variant="outline" leftIcon={Plus} onClick={() => addArrayItem('contacts', { name: '', designation: '', mobile: '', email: '', is_primary: false })}>Add Contact</Button>
      </div>
      {formData.contacts.length === 0 && <div className="text-center p-md text-tertiary">No contacts added.</div>}
      {formData.contacts.map((contact, index) => (
        <div key={index} className="bg-surface-hover p-sm rounded border-light mb-sm relative">
          <button type="button" className="absolute top-2 right-2 text-danger hover:bg-danger-light p-xs rounded" onClick={() => removeArrayItem('contacts', index)}><Trash2 size={16}/></button>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Name *</label>
              <input type="text" className="form-control form-control-sm" required value={contact.name} onChange={(e) => handleArrayChange('contacts', index, 'name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input type="text" className="form-control form-control-sm" value={contact.mobile} onChange={(e) => handleArrayChange('contacts', index, 'mobile', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control form-control-sm" value={contact.email} onChange={(e) => handleArrayChange('contacts', index, 'email', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <hr className="my-md" />

      <h3 className="text-md font-semibold mb-sm">Documents</h3>
      <div className="flex justify-end mb-sm mt-[-40px]">
        <Button type="button" size="sm" variant="outline" leftIcon={Plus} onClick={() => addArrayItem('documents', { document_type: '', file_url: '' })}>Add Document</Button>
      </div>
      {formData.documents.length === 0 && <div className="text-center p-md text-tertiary">No documents added.</div>}
      {formData.documents.map((doc, index) => (
        <div key={index} className="bg-surface-hover p-sm rounded border-light mb-sm relative">
          <button type="button" className="absolute top-2 right-2 text-danger hover:bg-danger-light p-xs rounded" onClick={() => removeArrayItem('documents', index)}><Trash2 size={16}/></button>
          <div className="form-grid">
            <div className="form-group">
              <label>Document Type *</label>
              <input type="text" className="form-control form-control-sm" required value={doc.document_type} onChange={(e) => handleArrayChange('documents', index, 'document_type', e.target.value)} placeholder="e.g. GST Certificate" />
            </div>
            <div className="form-group">
              <label>File Upload *</label>
              <div className="flex gap-sm align-center">
                <input type="file" disabled={isLoading} className="form-control form-control-sm" onChange={(e) => handleFileUpload(index, e.target.files[0])} />
                {doc.file_url && <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-primary text-sm whitespace-nowrap">View File</a>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Customer' : 'Create New Customer'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && <div className="alert alert-danger mb-md p-sm">{globalError}</div>}

      {/* Tabs Header */}
      <div className="border-b-light flex gap-md mb-lg relative" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`font-medium transition-colors relative ${activeTab === tab.id ? 'text-primary' : 'text-secondary-light hover:text-primary'}`}
            style={{ 
              marginBottom: '-1px', 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              outline: 'none', 
              padding: '0 8px 8px 8px',
              fontSize: '0.875rem',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="dense-form">
        
        {/* Tab Content */}
        <div style={{ minHeight: '300px' }}>
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'address' && renderAddress()}
          {activeTab === 'bank' && renderBankDetails()}
          {activeTab === 'contact_docs' && renderContactDocs()}
        </div>

        <div className="form-actions mt-xl flex justify-end gap-sm pt-md border-t-light">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading}>
            {isEditMode ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
