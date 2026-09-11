import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, MapPin, Landmark, User, FileText, Building2, AlertCircle } from 'lucide-react';
import Button from '../../../../../../shared/components/Button';
import { businessService } from '../../../../../masters/services/business.service';
import { foundationService } from '../../../../../masters/services/foundation.service';
import StatusToggle from '../../../../../../shared/components/Input/StatusToggle';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'bank', label: 'Bank Details', icon: Landmark },
  { id: 'contact_docs', label: 'Contact & Documents', icon: FileText }
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

    addresses: [],
    banks: [],
    contacts: [],
    documents: []
  });

  // Fetch Dropdown Master Data with high limit to avoid missing options
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [currRes, countRes, stateRes, cityRes] = await Promise.all([
          foundationService.getCurrencies({ limit: 1000 }),
          foundationService.getCountries({ limit: 1000 }),
          foundationService.getStates({ limit: 1000 }),
          foundationService.getCities({ limit: 1000 })
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

  // Fetch full details when editing
  useEffect(() => {
    if (initialData && initialData.id) {
      const fetchFullCustomer = async () => {
        setIsLoading(true);
        try {
          const res = await businessService.getCustomerById(initialData.id);
          const fullData = res.data?.data || res.data || initialData;
          setFormData({
            customer_name: fullData.customer_name || '',
            customer_type: fullData.customer_type || '',
            customer_category: fullData.customer_category || '',
            gst_number: fullData.gst_number || '',
            pan_number: fullData.pan_number || '',
            iec_code: fullData.iec_code || '',
            cin_number: fullData.cin_number || '',
            tan_number: fullData.tan_number || '',
            credit_limit: fullData.credit_limit ?? '',
            payment_terms: fullData.payment_terms || '',
            currency_id: fullData.currency_id || '',
            status: fullData.status || 'Active',
            addresses: fullData.addresses || [],
            banks: fullData.banks || [],
            contacts: fullData.contacts || [],
            documents: fullData.documents || []
          });
        } catch (err) {
          console.error("Failed to fetch full customer details:", err);
          setFormData(prev => ({
            ...prev,
            ...initialData,
            addresses: initialData.addresses || [],
            banks: initialData.banks || [],
            contacts: initialData.contacts || [],
            documents: initialData.documents || []
          }));
        } finally {
          setIsLoading(false);
        }
      };
      fetchFullCustomer();
    } else {
      setFormData({
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
        addresses: [],
        banks: [],
        contacts: [],
        documents: []
      });
    }
  }, [initialData]);

  // --- Handlers ---
  const handleMainChange = (e) => {
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

  const handleFileUpload = async (index, file) => {
    if (!file) return;
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
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray.splice(index, 1);
      return { ...prev, [arrayName]: newArray };
    });
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
      // Clean payload without top-level database metadata
      const payload = {
        customer_name: formData.customer_name.trim(),
        customer_type: formData.customer_type || null,
        customer_category: formData.customer_category || null,
        gst_number: formData.gst_number ? formData.gst_number.trim().toUpperCase() : null,
        pan_number: formData.pan_number ? formData.pan_number.trim().toUpperCase() : null,
        iec_code: formData.iec_code ? formData.iec_code.trim().toUpperCase() : null,
        cin_number: formData.cin_number ? formData.cin_number.trim().toUpperCase() : null,
        tan_number: formData.tan_number ? formData.tan_number.trim().toUpperCase() : null,
        credit_limit: formData.credit_limit !== '' && formData.credit_limit !== null ? parseFloat(formData.credit_limit) : null,
        payment_terms: formData.payment_terms || null,
        currency_id: formData.currency_id || null,
        status: formData.status || 'Active',

        addresses: (formData.addresses || []).map(addr => ({
          ...(addr.id ? { id: addr.id } : {}),
          address_type: addr.address_type || 'Billing',
          address_line_1: addr.address_line_1 || null,
          address_line_2: addr.address_line_2 || null,
          pincode: addr.pincode || null,
          country_id: addr.country_id || null,
          state_id: addr.state_id || null,
          city_id: addr.city_id || null
        })),
        banks: (formData.banks || []).map(bank => ({
          ...(bank.id ? { id: bank.id } : {}),
          bank_name: bank.bank_name,
          branch: bank.branch || null,
          account_holder: bank.account_holder || null,
          account_number: bank.account_number || null,
          ifsc_code: bank.ifsc_code ? bank.ifsc_code.trim().toUpperCase() : null,
          swift_code: bank.swift_code ? bank.swift_code.trim().toUpperCase() : null
        })),
        contacts: (formData.contacts || []).map(contact => ({
          ...(contact.id ? { id: contact.id } : {}),
          name: contact.name,
          designation: contact.designation || null,
          mobile: contact.mobile || null,
          alternate_mobile: contact.alternate_mobile || null,
          email: contact.email || null,
          whatsapp: contact.whatsapp || null,
          is_primary: !!contact.is_primary
        })),
        documents: (formData.documents || []).map(doc => ({
          ...(doc.id ? { id: doc.id } : {}),
          document_type: doc.document_type,
          file_url: doc.file_url
        }))
      };

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

  // Badge count calculator for tabs
  const getTabBadgeCount = (tabId) => {
    switch (tabId) {
      case 'address': return formData.addresses.length;
      case 'bank': return formData.banks.length;
      case 'contact_docs': return formData.contacts.length + formData.documents.length;
      default: return null;
    }
  };

  // --- Render Sections ---
  const renderPersonalInfo = () => (
    <div className="form-grid pt-sm">
      <div className="form-group col-span-2 md:col-span-1">
        <label className="font-medium text-xs text-secondary mb-1 block">Customer Name <span className="text-danger">*</span></label>
        <input
          disabled={isLoading}
          required
          type="text"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleMainChange}
          className="form-control form-control-sm"
          placeholder="e.g. Acme Global Freight Ltd."
        />
      </div>
      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">Customer Type</label>
        <select
          disabled={isLoading}
          name="customer_type"
          value={formData.customer_type || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm"
        >
          <option value="">Select Type...</option>
          <option value="Exporter">Exporter</option>
          <option value="Importer">Importer</option>
          <option value="Agent">Agent</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">Customer Category</label>
        <input
          disabled={isLoading}
          type="text"
          name="customer_category"
          value={formData.customer_category || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm"
          placeholder="e.g. Premium, Regular"
        />
      </div>

      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">GST Number</label>
        <input
          disabled={isLoading}
          type="text"
          name="gst_number"
          value={formData.gst_number || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm uppercase"
          placeholder="22AAAAA0000A1Z5"
        />
      </div>
      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">PAN Number</label>
        <input
          disabled={isLoading}
          type="text"
          name="pan_number"
          value={formData.pan_number || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm uppercase"
          placeholder="ABCDE1234F"
        />
      </div>
      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">IEC Code</label>
        <input
          disabled={isLoading}
          type="text"
          name="iec_code"
          value={formData.iec_code || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm uppercase"
          placeholder="0123456789"
        />
      </div>

      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">CIN Number</label>
        <input
          disabled={isLoading}
          type="text"
          name="cin_number"
          value={formData.cin_number || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm uppercase"
          placeholder="U12345MH2020PTC123456"
        />
      </div>
      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">TAN Number</label>
        <input
          disabled={isLoading}
          type="text"
          name="tan_number"
          value={formData.tan_number || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm uppercase"
          placeholder="ABCD12345E"
        />
      </div>
      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">Credit Limit ($ / ₹)</label>
        <input
          disabled={isLoading}
          type="number"
          step="0.01"
          name="credit_limit"
          value={formData.credit_limit || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm"
          placeholder="e.g. 50000"
        />
      </div>

      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">Payment Terms</label>
        <input
          disabled={isLoading}
          type="text"
          name="payment_terms"
          value={formData.payment_terms || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm"
          placeholder="e.g. Net 30, COD"
        />
      </div>
      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">Default Currency</label>
        <select
          disabled={isLoading}
          name="currency_id"
          value={formData.currency_id || ''}
          onChange={handleMainChange}
          className="form-control form-control-sm"
        >
          <option value="">Select Currency...</option>
          {currencies.map(c => (
            <option key={c.id} value={c.id}>{c.currency_code} ({c.currency_name})</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="font-medium text-xs text-secondary mb-1 block">Status</label>
        <StatusToggle
          value={formData.status}
          onChange={(val) => handleMainChange({ target: { name: 'status', value: val } })}
          disabled={isLoading}
        />
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="pt-sm space-y-4">
      <div className="flex justify-between items-center mb-sm">
        <div>
          <h3 className="text-sm font-semibold text-text-primary m-0">Customer Addresses</h3>
          <p className="text-xs text-secondary-light m-0">Manage billing, shipping, and registered addresses.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          leftIcon={Plus}
          onClick={() => addArrayItem('addresses', { address_type: 'Billing', address_line_1: '', address_line_2: '', pincode: '', country_id: null, state_id: null, city_id: null })}
        >
          Add Address
        </Button>
      </div>

      {formData.addresses.length === 0 && (
        <div className="text-center p-xl border border-dashed rounded-lg text-tertiary bg-surface-hover">
          <MapPin size={24} className="mx-auto mb-xs opacity-40 text-text-primary" />
          <p className="text-sm font-medium mb-1">No addresses added yet</p>
          <p className="text-xs text-secondary-light">Click "Add Address" to add billing or shipping addresses.</p>
        </div>
      )}

      {formData.addresses.map((addr, index) => {
        const availableStates = states.filter(s => s.country_id === addr.country_id && (s.status === 'Active' || s.id === addr.state_id));
        const availableCities = cities.filter(c => c.state_id === addr.state_id && (c.status === 'Active' || c.id === addr.city_id));

        return (
          <div key={index} className="bg-surface p-md rounded-lg border border-light shadow-xs mb-md transition-all">
            {/* Header row fixing overlap issue completely */}
            <div className="flex justify-between items-center pb-xs mb-sm border-b border-light">
              <div className="flex items-center gap-xs">
                <span className="font-semibold text-xs uppercase text-text-primary">Address #{index + 1}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-hover border border-light font-medium text-secondary">
                  {addr.address_type || 'Billing'}
                </span>
              </div>
              <button
                type="button"
                className="text-danger hover:bg-danger-light p-xs rounded flex items-center gap-1 text-xs font-medium border border-transparent hover:border-danger-light transition-all"
                onClick={() => removeArrayItem('addresses', index)}
                title="Remove Address"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="font-medium text-xs text-secondary mb-1 block">Address Type</label>
                <select
                  className="form-control form-control-sm"
                  value={addr.address_type}
                  onChange={(e) => handleArrayChange('addresses', index, 'address_type', e.target.value)}
                >
                  <option value="Billing">Billing</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Registered">Registered</option>
                </select>
              </div>

              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-medium text-xs text-secondary mb-1 block">Address Line 1</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={addr.address_line_1 || ''}
                  onChange={(e) => handleArrayChange('addresses', index, 'address_line_1', e.target.value)}
                  placeholder="Street address, building, suite"
                />
              </div>

              <div className="form-group">
                <label className="font-medium text-xs text-secondary mb-1 block">Pincode / Zip Code</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={addr.pincode || ''}
                  onChange={(e) => handleArrayChange('addresses', index, 'pincode', e.target.value)}
                  placeholder="e.g. 400001"
                />
              </div>

              {/* Country Selection */}
              <div className="form-group">
                <label className="font-medium text-xs text-secondary mb-1 block">Country</label>
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
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.country_name}</option>
                  ))}
                </select>
              </div>

              {/* State Selection (Cascading: Visible after Country Selection) */}
              {addr.country_id ? (
                <div className="form-group">
                  <label className="font-medium text-xs text-secondary mb-1 block">State</label>
                  <select
                    className="form-control form-control-sm"
                    value={addr.state_id || ''}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      handleArrayChange('addresses', index, 'state_id', val);
                      handleArrayChange('addresses', index, 'city_id', null);
                    }}
                  >
                    <option value="">Select State...</option>
                    {availableStates.map(s => (
                      <option key={s.id} value={s.id}>{s.state_name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group opacity-60">
                  <label className="font-medium text-xs text-secondary mb-1 block">State</label>
                  <div className="p-xs text-xs border border-light rounded bg-surface-hover text-tertiary flex items-center gap-1">
                    <AlertCircle size={12} /> Select Country first
                  </div>
                </div>
              )}

              {/* City Selection (Cascading: Visible after State Selection) */}
              {addr.state_id ? (
                <div className="form-group">
                  <label className="font-medium text-xs text-secondary mb-1 block">City</label>
                  <select
                    className="form-control form-control-sm"
                    value={addr.city_id || ''}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      handleArrayChange('addresses', index, 'city_id', val);
                    }}
                  >
                    <option value="">Select City...</option>
                    {availableCities.map(c => (
                      <option key={c.id} value={c.id}>{c.city_name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group opacity-60">
                  <label className="font-medium text-xs text-secondary mb-1 block">City</label>
                  <div className="p-xs text-xs border border-light rounded bg-surface-hover text-tertiary flex items-center gap-1">
                    <AlertCircle size={12} /> Select State first
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderBankDetails = () => (
    <div className="pt-sm space-y-4">
      <div className="flex justify-between items-center mb-sm">
        <div>
          <h3 className="text-sm font-semibold text-text-primary m-0">Bank Account Details</h3>
          <p className="text-xs text-secondary-light m-0">Banking info for payments and invoicing.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          leftIcon={Plus}
          onClick={() => addArrayItem('banks', { bank_name: '', branch: '', account_holder: '', account_number: '', ifsc_code: '', swift_code: '' })}
        >
          Add Bank Account
        </Button>
      </div>

      {formData.banks.length === 0 && (
        <div className="text-center p-xl border border-dashed rounded-lg text-tertiary bg-surface-hover">
          <Landmark size={24} className="mx-auto mb-xs opacity-40 text-text-primary" />
          <p className="text-sm font-medium mb-1">No bank details added yet</p>
          <p className="text-xs text-secondary-light">Click "Add Bank Account" to record bank account details.</p>
        </div>
      )}

      {formData.banks.map((bank, index) => (
        <div key={index} className="bg-surface p-md rounded-lg border border-light shadow-xs mb-md">
          <div className="flex justify-between items-center pb-xs mb-sm border-b border-light">
            <span className="font-semibold text-xs uppercase text-text-primary">Bank Account #{index + 1}</span>
            <button
              type="button"
              className="text-danger hover:bg-danger-light p-xs rounded flex items-center gap-1 text-xs font-medium transition-all"
              onClick={() => removeArrayItem('banks', index)}
              title="Remove Bank Account"
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="font-medium text-xs text-secondary mb-1 block">Bank Name <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control form-control-sm"
                required
                value={bank.bank_name || ''}
                onChange={(e) => handleArrayChange('banks', index, 'bank_name', e.target.value)}
                placeholder="e.g. HDFC Bank, HSBC"
              />
            </div>
            <div className="form-group">
              <label className="font-medium text-xs text-secondary mb-1 block">Account Number</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={bank.account_number || ''}
                onChange={(e) => handleArrayChange('banks', index, 'account_number', e.target.value)}
                placeholder="e.g. 50100028491823"
              />
            </div>
            <div className="form-group">
              <label className="font-medium text-xs text-secondary mb-1 block">IFSC Code</label>
              <input
                type="text"
                className="form-control form-control-sm uppercase"
                value={bank.ifsc_code || ''}
                onChange={(e) => handleArrayChange('banks', index, 'ifsc_code', e.target.value)}
                placeholder="e.g. HDFC0000123"
              />
            </div>
            <div className="form-group">
              <label className="font-medium text-xs text-secondary mb-1 block">Swift Code</label>
              <input
                type="text"
                className="form-control form-control-sm uppercase"
                value={bank.swift_code || ''}
                onChange={(e) => handleArrayChange('banks', index, 'swift_code', e.target.value)}
                placeholder="e.g. HDFCINBBXXX"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContactDocs = () => (
    <div className="pt-sm space-y-6">
      {/* Contacts Section */}
      <div>
        <div className="flex justify-between items-center mb-sm">
          <div>
            <h3 className="text-sm font-semibold text-text-primary m-0">Contact Persons</h3>
            <p className="text-xs text-secondary-light m-0">Key contact representatives for this customer.</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={Plus}
            onClick={() => addArrayItem('contacts', { name: '', designation: '', mobile: '', email: '', is_primary: false })}
          >
            Add Contact
          </Button>
        </div>

        {formData.contacts.length === 0 && (
          <div className="text-center p-md border border-dashed rounded-lg text-tertiary bg-surface-hover mb-md">
            <p className="text-xs text-secondary-light m-0">No contacts added. Click "Add Contact" to add one.</p>
          </div>
        )}

        {formData.contacts.map((contact, index) => (
          <div key={index} className="bg-surface p-md rounded-lg border border-light shadow-xs mb-sm">
            <div className="flex justify-between items-center pb-xs mb-sm border-b border-light">
              <span className="font-semibold text-xs uppercase text-text-primary">Contact #{index + 1}</span>
              <button
                type="button"
                className="text-danger hover:bg-danger-light p-xs rounded flex items-center gap-1 text-xs font-medium transition-all"
                onClick={() => removeArrayItem('contacts', index)}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="font-medium text-xs text-secondary mb-1 block">Contact Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  value={contact.name || ''}
                  onChange={(e) => handleArrayChange('contacts', index, 'name', e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="form-group">
                <label className="font-medium text-xs text-secondary mb-1 block">Mobile</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={contact.mobile || ''}
                  onChange={(e) => handleArrayChange('contacts', index, 'mobile', e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="form-group">
                <label className="font-medium text-xs text-secondary mb-1 block">Email</label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  value={contact.email || ''}
                  onChange={(e) => handleArrayChange('contacts', index, 'email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="my-md border-light" />

      {/* Documents Section */}
      <div>
        <div className="flex justify-between items-center mb-sm">
          <div>
            <h3 className="text-sm font-semibold text-text-primary m-0">Documents & Certificates</h3>
            <p className="text-xs text-secondary-light m-0">Attach GST certificates, PAN cards, or registration files.</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={Plus}
            onClick={() => addArrayItem('documents', { document_type: '', file_url: '' })}
          >
            Add Document
          </Button>
        </div>

        {formData.documents.length === 0 && (
          <div className="text-center p-md border border-dashed rounded-lg text-tertiary bg-surface-hover">
            <p className="text-xs text-secondary-light m-0">No documents uploaded. Click "Add Document" to attach files.</p>
          </div>
        )}

        {formData.documents.map((doc, index) => (
          <div key={index} className="bg-surface p-md rounded-lg border border-light shadow-xs mb-sm">
            <div className="flex justify-between items-center pb-xs mb-sm border-b border-light">
              <span className="font-semibold text-xs uppercase text-text-primary">Document #{index + 1}</span>
              <button
                type="button"
                className="text-danger hover:bg-danger-light p-xs rounded flex items-center gap-1 text-xs font-medium transition-all"
                onClick={() => removeArrayItem('documents', index)}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="font-medium text-xs text-secondary mb-1 block">Document Type <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  value={doc.document_type || ''}
                  onChange={(e) => handleArrayChange('documents', index, 'document_type', e.target.value)}
                  placeholder="e.g. GST Certificate, PAN Copy"
                />
              </div>
              <div className="form-group">
                <label className="font-medium text-xs text-secondary mb-1 block">File Upload <span className="text-danger">*</span></label>
                <div className="flex gap-sm items-center">
                  <input
                    type="file"
                    disabled={isLoading}
                    className="form-control form-control-sm"
                    onChange={(e) => handleFileUpload(index, e.target.files[0])}
                  />
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-text-primary text-xs font-semibold underline whitespace-nowrap">
                      View File
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-surface border border-light rounded-xl shadow-md p-lg transition-all">
      {/* Top Title Bar */}
      <div className="flex justify-between items-center mb-md pb-xs border-b border-light">
        <div className="flex items-center gap-sm">
          <div className="p-2 rounded-lg bg-surface-hover text-text-primary border border-light">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary m-0">{isEditMode ? 'Edit Customer Details' : 'Create New Customer'}</h2>
            <p className="text-xs text-secondary-light m-0">Fill in company details, addresses, and banking contacts.</p>
          </div>
        </div>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && (
        <div className="alert alert-danger mb-md p-sm rounded-lg flex items-center gap-sm text-xs font-medium">
          <AlertCircle size={16} />
          <span>{globalError}</span>
        </div>
      )}

      {/* Tabs Navigation in FreightFlow theme */}
      <div className="form-tabs-container">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const badgeCount = getTabBadgeCount(tab.id);
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={`form-tab-item ${isActive ? 'active accent-top' : ''}`}
              style={{
                background: isActive ? 'var(--surface, #ffffff)' : 'transparent',
                outline: 'none',
                boxShadow: isActive ? '0 -2px 8px rgba(0,0,0,0.04)' : 'none',
                borderTop: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                borderLeft: isActive ? '1px solid var(--border)' : '1px solid transparent',
                borderRight: isActive ? '1px solid var(--border)' : '1px solid transparent',
                borderBottom: '3px solid transparent',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                padding: '0.65rem 1.25rem',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {badgeCount > 0 && (
                <span className="form-tab-badge">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="dense-form">
        <div style={{ minHeight: '320px' }}>
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'address' && renderAddress()}
          {activeTab === 'bank' && renderBankDetails()}
          {activeTab === 'contact_docs' && renderContactDocs()}
        </div>

        {/* Footer Actions */}
        <div className="form-actions mt-xl flex justify-end gap-sm pt-md border-t border-light">
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
