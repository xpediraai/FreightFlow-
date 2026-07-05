import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { businessService } from '../../../../../masters/services/business.service';
import { foundationService } from '../../../../../masters/services/foundation.service';

const VendorForm = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  
  // Dropdowns
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const [formData, setFormData] = useState({
    vendor_code: '',
    vendor_name: '',
    vendor_type: 'Other',
    gst_number: '',
    pan_number: '',
    contact_person: '',
    mobile: '',
    email: '',
    country_id: '',
    state_id: '',
    city_id: '',
    address: '',
    currency_id: '',
    payment_terms: '',
    status: 'Active',
    addresses: [],
    banks: [],
    contacts: []
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const extractData = (res) => {
          if (res?.data?.data?.data && Array.isArray(res.data.data.data)) return res.data.data.data;
          if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
          if (res?.data && Array.isArray(res.data)) return res.data;
          if (Array.isArray(res)) return res;
          return [];
        };

        const [countryRes, currRes] = await Promise.all([
          foundationService.getCountries(),
          foundationService.getCurrencies()
        ]);
        
        setCountries(extractData(countryRes).filter(c => c.status === 'Active'));
        setCurrencies(extractData(currRes).filter(c => c.status === 'Active'));
      } catch (err) {
        console.error('Failed to fetch dropdowns:', err);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (initialData) {
      // In edit mode, we would also fetch full vendor details with nested arrays if the list API doesn't provide them.
      // Assuming getVendorById will be used if needed. For now, we'll use initialData.
      const fetchDetails = async () => {
        try {
          const res = await businessService.getVendorById(initialData.id);
          const fullData = res.data?.data || initialData;
          setFormData({
            ...formData,
            ...fullData,
            addresses: fullData.addresses || [],
            banks: fullData.banks || [],
            contacts: fullData.contacts || []
          });
        } catch (err) {
          console.error("Failed to load full details", err);
          setFormData(prev => ({ ...prev, ...initialData }));
        }
      };
      if (initialData.id) fetchDetails();
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleAddArrayItem = (arrayName, defaultObj) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultObj]
    }));
  };

  const handleRemoveArrayItem = (arrayName, index) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray.splice(index, 1);
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.vendor_name.trim() || !formData.vendor_code.trim()) {
      setError('Vendor Code and Name are required.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { ...formData };
      
      // Clean up empty UUIDs to be null
      if (!payload.country_id) payload.country_id = null;
      if (!payload.state_id) payload.state_id = null;
      if (!payload.city_id) payload.city_id = null;
      if (!payload.currency_id) payload.currency_id = null;

      if (isEditMode) {
        await businessService.updateVendor(initialData.id, payload);
      } else {
        await businessService.createVendor(payload);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save vendor');
    } finally {
      setIsLoading(false);
    }
  };

  // UI rendering for tabs
  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'address', label: 'Address' },
    { id: 'bank', label: 'Bank Details' },
    { id: 'contact', label: 'Contact Info' }
  ];

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg">
      <div className="flex justify-between align-center mb-md">
        <h2 className="text-lg font-semibold m-0">{isEditMode ? 'Edit Vendor' : 'Create New Vendor'}</h2>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {error && <div className="alert alert-danger mb-md p-sm">{error}</div>}

      <div className="border-b-light flex gap-md mb-lg">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            className={`pb-sm font-medium transition-colors ${activeTab === t.id ? 'text-primary border-b-2 border-primary' : 'text-secondary-light hover:text-text'}`}
            style={{ marginBottom: '-1px' }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="dense-form">
        
        {/* TAB 1: Personal Info */}
        {activeTab === 'personal' && (
          <div className="form-grid">
            <div className="form-group">
              <label>Vendor Code *</label>
              <input disabled={isLoading} required type="text" name="vendor_code" value={formData.vendor_code} onChange={handleChange} className="form-control form-control-sm uppercase" />
            </div>
            <div className="form-group">
              <label>Vendor Name *</label>
              <input disabled={isLoading} required type="text" name="vendor_name" value={formData.vendor_name} onChange={handleChange} className="form-control form-control-sm" />
            </div>
            <div className="form-group">
              <label>Vendor Type</label>
              <select disabled={isLoading} name="vendor_type" value={formData.vendor_type} onChange={handleChange} className="form-control form-control-sm">
                <option value="Shipping Line">Shipping Line</option>
                <option value="Transporter">Transporter</option>
                <option value="CHA">CHA</option>
                <option value="CFS">CFS</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Surveyor">Surveyor</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select disabled={isLoading} name="currency_id" value={formData.currency_id || ''} onChange={handleChange} className="form-control form-control-sm">
                <option value="">Select Currency...</option>
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>{c.currency_code} - {c.currency_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input disabled={isLoading} type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} className="form-control form-control-sm uppercase" />
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input disabled={isLoading} type="text" name="pan_number" value={formData.pan_number} onChange={handleChange} className="form-control form-control-sm uppercase" />
            </div>
            <div className="form-group">
              <label>Payment Terms</label>
              <input disabled={isLoading} type="text" name="payment_terms" value={formData.payment_terms} onChange={handleChange} className="form-control form-control-sm" placeholder="e.g. Net 30" />
            </div>
            {isEditMode && (
              <div className="form-group">
                <label>Status</label>
                <select disabled={isLoading} name="status" value={formData.status} onChange={handleChange} className="form-control form-control-sm">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Address */}
        {activeTab === 'address' && (
          <div>
            <h4 className="text-md font-semibold mb-sm">Primary Address</h4>
            <div className="form-grid mb-lg border-b-light pb-lg">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <textarea disabled={isLoading} name="address" value={formData.address} onChange={handleChange} className="form-control form-control-sm" rows="2" />
              </div>
              <div className="form-group">
                <label>Country</label>
                <select disabled={isLoading} name="country_id" value={formData.country_id || ''} onChange={handleChange} className="form-control form-control-sm">
                  <option value="">Select Country...</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.country_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between align-center mb-sm">
              <h4 className="text-md font-semibold m-0">Additional Addresses</h4>
              <Button type="button" variant="outline" size="sm" leftIcon={Plus} onClick={() => handleAddArrayItem('addresses', { address_type: 'Branch', country_id: '', address_line_1: '' })}>
                Add Address
              </Button>
            </div>
            
            {formData.addresses.length === 0 ? (
              <div className="p-md text-center text-tertiary border-light border-dashed rounded-lg">No additional addresses added.</div>
            ) : (
              <div className="space-y-md">
                {formData.addresses.map((addr, i) => (
                  <div key={i} className="flex items-start gap-md p-md bg-background rounded-lg border-light relative">
                    <button type="button" className="absolute top-2 right-2 text-danger hover:text-danger-dark transition-colors" onClick={() => handleRemoveArrayItem('addresses', i)}>
                      <Trash2 size={16} />
                    </button>
                    <div className="form-grid flex-1 w-full mt-sm">
                      <div className="form-group">
                        <label>Type</label>
                        <input type="text" value={addr.address_type} onChange={e => handleArrayChange('addresses', i, 'address_type', e.target.value)} className="form-control form-control-sm" placeholder="e.g. Branch, Warehouse" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Address Line 1</label>
                        <input type="text" value={addr.address_line_1} onChange={e => handleArrayChange('addresses', i, 'address_line_1', e.target.value)} className="form-control form-control-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Bank Details */}
        {activeTab === 'bank' && (
          <div>
            <div className="flex justify-between align-center mb-sm">
              <h4 className="text-md font-semibold m-0">Bank Accounts</h4>
              <Button type="button" variant="outline" size="sm" leftIcon={Plus} onClick={() => handleAddArrayItem('banks', { bank_name: '', branch: '', account_holder: '', account_number: '', ifsc_code: '' })}>
                Add Bank Account
              </Button>
            </div>
            
            {formData.banks.length === 0 ? (
              <div className="p-md text-center text-tertiary border-light border-dashed rounded-lg">No bank accounts added.</div>
            ) : (
              <div className="space-y-md">
                {formData.banks.map((bank, i) => (
                  <div key={i} className="flex items-start gap-md p-md bg-background rounded-lg border-light relative">
                    <button type="button" className="absolute top-2 right-2 text-danger hover:text-danger-dark transition-colors" onClick={() => handleRemoveArrayItem('banks', i)}>
                      <Trash2 size={16} />
                    </button>
                    <div className="form-grid flex-1 w-full mt-sm">
                      <div className="form-group">
                        <label>Bank Name *</label>
                        <input required type="text" value={bank.bank_name} onChange={e => handleArrayChange('banks', i, 'bank_name', e.target.value)} className="form-control form-control-sm" />
                      </div>
                      <div className="form-group">
                        <label>Account Name</label>
                        <input type="text" value={bank.account_holder} onChange={e => handleArrayChange('banks', i, 'account_holder', e.target.value)} className="form-control form-control-sm" />
                      </div>
                      <div className="form-group">
                        <label>Account Number</label>
                        <input type="text" value={bank.account_number} onChange={e => handleArrayChange('banks', i, 'account_number', e.target.value)} className="form-control form-control-sm" />
                      </div>
                      <div className="form-group">
                        <label>IFSC Code</label>
                        <input type="text" value={bank.ifsc_code} onChange={e => handleArrayChange('banks', i, 'ifsc_code', e.target.value)} className="form-control form-control-sm uppercase" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Contact Info */}
        {activeTab === 'contact' && (
          <div>
            <h4 className="text-md font-semibold mb-sm">Primary Contact</h4>
            <div className="form-grid mb-lg border-b-light pb-lg">
              <div className="form-group">
                <label>Contact Person</label>
                <input disabled={isLoading} type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} className="form-control form-control-sm" />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input disabled={isLoading} type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="form-control form-control-sm" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input disabled={isLoading} type="email" name="email" value={formData.email} onChange={handleChange} className="form-control form-control-sm" />
              </div>
            </div>

            <div className="flex justify-between align-center mb-sm">
              <h4 className="text-md font-semibold m-0">Additional Contacts</h4>
              <Button type="button" variant="outline" size="sm" leftIcon={Plus} onClick={() => handleAddArrayItem('contacts', { name: '', designation: '', mobile: '', email: '' })}>
                Add Contact
              </Button>
            </div>
            
            {formData.contacts.length === 0 ? (
              <div className="p-md text-center text-tertiary border-light border-dashed rounded-lg">No additional contacts added.</div>
            ) : (
              <div className="space-y-md">
                {formData.contacts.map((contact, i) => (
                  <div key={i} className="flex items-start gap-md p-md bg-background rounded-lg border-light relative">
                    <button type="button" className="absolute top-2 right-2 text-danger hover:text-danger-dark transition-colors" onClick={() => handleRemoveArrayItem('contacts', i)}>
                      <Trash2 size={16} />
                    </button>
                    <div className="form-grid flex-1 w-full mt-sm">
                      <div className="form-group">
                        <label>Name *</label>
                        <input required type="text" value={contact.name} onChange={e => handleArrayChange('contacts', i, 'name', e.target.value)} className="form-control form-control-sm" />
                      </div>
                      <div className="form-group">
                        <label>Designation</label>
                        <input type="text" value={contact.designation} onChange={e => handleArrayChange('contacts', i, 'designation', e.target.value)} className="form-control form-control-sm" />
                      </div>
                      <div className="form-group">
                        <label>Mobile</label>
                        <input type="text" value={contact.mobile} onChange={e => handleArrayChange('contacts', i, 'mobile', e.target.value)} className="form-control form-control-sm" />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={contact.email} onChange={e => handleArrayChange('contacts', i, 'email', e.target.value)} className="form-control form-control-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="form-actions flex justify-end gap-sm mt-lg pt-md border-t-light">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading} isLoading={isLoading}>
            {isEditMode ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;
