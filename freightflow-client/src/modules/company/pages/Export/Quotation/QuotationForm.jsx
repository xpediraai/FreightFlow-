import React, { useState, useEffect, useRef } from 'react';
import { X, Check, FileText, Building2, MapPin, Package, Box, Calendar, Ship, ShieldCheck, DollarSign, Calculator, ChevronDown, ChevronUp, AlertCircle, Plus, Trash2, RotateCcw, Info, Paperclip, Upload, ExternalLink, File, Download, FileSpreadsheet, Image as ImageIcon, Loader2 } from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import { businessService } from '../../../../masters/services/business.service';
import { logisticsService } from '../../../../masters/services/logistics.service';
import { commonService } from '../../../../masters/services/common.service';
import { foundationService } from '../../../../masters/services/foundation.service';
import { shippingInquiryService } from '../ShippingInquiry/shippingInquiry.service';
import { exportQuotationService } from './exportQuotation.service';

export const generateQuotationNo = (existingCount = 0) => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const seq = String(existingCount + 1).padStart(3, '0');
  return `EQUOT/SS/${month}-${year}/${seq}`;
};

export const INITIAL_CHARGE_HEADS = [];

const DEFAULT_CARRIER_A = { line: '', freight: '', local: '', notes: '' };
const DEFAULT_CARRIER_B = { line: '', freight: '', local: '', notes: '' };
const DEFAULT_CARRIER_C = { line: '', freight: '', local: '', notes: '' };

const DEFAULT_CURRENCIES = [
  { id: 'curr_inr', currency_code: 'INR', symbol: '₹', currency_name: 'Indian Rupee (INR)' },
  { id: 'curr_usd', currency_code: 'USD', symbol: '$', currency_name: 'US Dollar (USD)' },
  { id: 'curr_eur', currency_code: 'EUR', symbol: '€', currency_name: 'Euro (EUR)' },
  { id: 'curr_aed', currency_code: 'AED', symbol: 'AED', currency_name: 'UAE Dirham (AED)' },
  { id: 'curr_gbp', currency_code: 'GBP', symbol: '£', currency_name: 'British Pound (GBP)' },
  { id: 'curr_sgd', currency_code: 'SGD', symbol: 'S$', currency_name: 'Singapore Dollar (SGD)' },
];

const DEFAULT_UOMS = [
  { id: 'uom_1', uom_code: 'KG', uom_name: 'Kilograms (KG)' },
  { id: 'uom_2', uom_code: 'MT', uom_name: 'Metric Tonnes (MT)' },
  { id: 'uom_3', uom_code: 'LBS', uom_name: 'Pounds (LBS)' },
  { id: 'uom_4', uom_code: 'CBM', uom_name: 'Cubic Meters (CBM)' },
  { id: 'uom_5', uom_code: 'PCS', uom_name: 'Pieces (PCS)' }
];

const parseWeightString = (str = '') => {
  if (!str) return { val: '', uom: 'KG' };
  const cleaned = String(str).trim();
  const match = cleaned.match(/^([\d.,]+)\s*([A-Za-z]+)?$/);
  if (match) {
    return {
      val: match[1] || '',
      uom: (match[2] || 'KG').toUpperCase()
    };
  }
  return { val: cleaned, uom: 'KG' };
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileIcon = (mimetype = '', name = '') => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (mimetype.startsWith('image/') || ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(ext)) {
    return <ImageIcon size={20} color="#0288d1" />;
  }
  if (mimetype.includes('pdf') || ext === 'pdf') {
    return <FileText size={20} color="#dc2626" />;
  }
  if (mimetype.includes('sheet') || mimetype.includes('excel') || mimetype.includes('csv') || ['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet size={20} color="#16a34a" />;
  }
  return <File size={20} color="#64748b" />;
};

const getFullFileUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

const QuotationForm = ({ onCancel, onSuccess, initialData, existingCount = 0 }) => {
  const isEditMode = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const fileInputRef = useRef(null);

  // Loaded Shipping Inquiries for Dropdown Linkage
  const [savedInquiries, setSavedInquiries] = useState([]);
  const [shippingLinesMaster, setShippingLinesMaster] = useState([]);
  const [uoms, setUoms] = useState(DEFAULT_UOMS);
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
  const [chargeMasters, setChargeMasters] = useState(INITIAL_CHARGE_HEADS);

  // Form State
  const [formData, setFormData] = useState({
    quotation_no: '',
    quotation_date: new Date().toISOString().split('T')[0],
    currency: 'INR',
    inquiry_id: '',
    inquiry_no: '',
    exporter_id: '',
    exporter_name: '',
    pol: '',
    pod: '',
    fpod: '',
    commodity: '',
    hsn_code: '',
    cargo_type: 'General',
    gross_weight: '',
    weight_value: '',
    weight_uom: 'KG',
    container_type: "20'",
    no_of_containers: '1',
    shipment_terms: 'FOB',
    cargo_ready_date: '',
    stuffing_location: 'Factory',
    stuffing_location_other: '',
    shipping_line_preference: '',
    free_days_required: '',
    special_requirements: '',
    
    // Customs Verification Checklist
    customs_verification_status: 'Checked & Verified',
    customs_commodity_checked: 'Yes',
    customs_cargo_photos: 'Available',
    customs_hsn_status: 'Verified',
    customs_restrictions: 'None',
    customs_notes: '',

    // Carrier Options
    carrier_option_a: DEFAULT_CARRIER_A,
    carrier_option_b: DEFAULT_CARRIER_B,
    carrier_option_c: DEFAULT_CARRIER_C,
    selected_carrier: '',
    carrier_selection_notes: '',

    // Attachments
    attachments: [],

    // Status
    status: 'Prepared',
    priority: 'Medium'
  });


  // Line Item Charges State (Loaded dynamically from Charge Master)
  const [charges, setCharges] = useState([]);

  // Calculate Total Quotation Amount
  const totalAmount = charges.reduce((sum, item) => {
    return item.applicable ? sum + (Number(item.amount) || 0) : sum;
  }, 0);

  // Derived Currency display helpers
  const selectedCurrencyObj = currencies.find(c => (c.currency_code || c.code) === (formData.currency || 'INR'));
  const currencySymbol = selectedCurrencyObj?.symbol || formData.currency || '₹';
  const currencyCode = formData.currency || 'INR';

  // Master Currency Switcher - updates header and all charge lines
  const handleCurrencyChange = (newCurrency) => {
    setFormData(prev => ({ ...prev, currency: newCurrency }));
    setCharges(prevCharges => prevCharges.map(item => ({
      ...item,
      currency: newCurrency
    })));
  };

  // Fetch Saved Inquiries & Master Shipping Lines & UOMs & Currencies
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await shippingInquiryService.getInquiries({ limit: 500 });
        const list = res?.data?.data?.inquiries || res?.data?.inquiries || res?.data || [];
        if (Array.isArray(list)) setSavedInquiries(list);
      } catch (err) {
        console.error('Failed to load saved inquiries for dropdown:', err);
      }
    };
    fetchInquiries();

    const fetchMasters = async () => {
      try {
        const [linesRes, uomRes, chargeRes, currRes] = await Promise.allSettled([
          logisticsService.getShippingLines(),
          commonService.getUOMs(),
          businessService.getCharges(),
          foundationService.getCurrencies({ page: 1, limit: 10000 })
        ]);
        if (linesRes.status === 'fulfilled' && linesRes.value) {
          const data = linesRes.value?.data?.data?.data || linesRes.value?.data?.data || linesRes.value?.data;
          if (Array.isArray(data)) setShippingLinesMaster(data);
        }
        if (uomRes.status === 'fulfilled' && uomRes.value) {
          const data = uomRes.value?.data?.data?.data || uomRes.value?.data?.data || uomRes.value?.data;
          if (Array.isArray(data)) setUoms(data);
        }
        if (currRes.status === 'fulfilled' && currRes.value) {
          const currData = currRes.value?.data?.data?.data || currRes.value?.data?.data || currRes.value?.data;
          if (Array.isArray(currData) && currData.length > 0) {
            const activeCurrs = currData.filter(c => c.status !== 'Inactive');
            if (activeCurrs.length > 0) {
              setCurrencies(activeCurrs);
            }
          }
        }
        let chargeData = [];
        if (chargeRes.status === 'fulfilled' && chargeRes.value) {
          chargeData = chargeRes.value?.data?.data?.data || chargeRes.value?.data?.data || chargeRes.value?.data || [];
        }
        if (!Array.isArray(chargeData) || chargeData.length === 0) {
          try {
            const localRaw = localStorage.getItem('freightflow_charge_masters');
            if (localRaw) chargeData = JSON.parse(localRaw);
          } catch (lErr) {}
        }
        if (Array.isArray(chargeData) && chargeData.length > 0) {
          const activeMasters = chargeData.filter(c => c.status !== 'Inactive');
          const mappedMasters = activeMasters.map((c, i) => ({
            id: c.id || `cm_${i}`,
            name: c.charge_name || c.name || c.description,
            basis: c.basis || c.uom || 'Per Container',
            currency: c.default_currency || c.currency || 'INR',
            defaultApplicable: c.default_applicable ?? true,
            rate: Number(c.default_rate || c.rate || 0),
            quantity: Number(c.default_qty || c.quantity || 1)
          }));
          setChargeMasters(mappedMasters);

          if (!initialData) {
            setCharges(mappedMasters.map(cm => ({
              id: `ch_${cm.id}`,
              name: cm.name,
              basis: cm.basis,
              currency: formData.currency || cm.currency || 'INR',
              applicable: cm.defaultApplicable,
              quantity: cm.quantity,
              rate: cm.rate,
              amount: cm.defaultApplicable ? cm.quantity * cm.rate : 0
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch masters:', err);
      }
    };
    fetchMasters();
  }, []);

  // Initialize or Populate Form Data
  useEffect(() => {
    if (initialData) {
      const rawWeight = initialData.gross_weight || initialData.weight || '';
      const parsedWeight = parseWeightString(rawWeight);

      let initialAttachments = [];
      if (Array.isArray(initialData.attachments)) {
        initialAttachments = initialData.attachments;
      } else if (typeof initialData.attachments === 'string' && initialData.attachments.trim()) {
        try {
          initialAttachments = JSON.parse(initialData.attachments);
        } catch (e) {
          initialAttachments = [];
        }
      }

      const initialCurrency = initialData.currency || initialData.charges?.[0]?.currency || 'INR';

      setFormData(prev => ({
        ...prev,
        ...initialData,
        currency: initialCurrency,
        gross_weight: rawWeight,
        weight_value: initialData.weight_value || parsedWeight.val,
        weight_uom: initialData.weight_uom || parsedWeight.uom,
        carrier_option_a: initialData.carrier_option_a || DEFAULT_CARRIER_A,
        carrier_option_b: initialData.carrier_option_b || DEFAULT_CARRIER_B,
        carrier_option_c: initialData.carrier_option_c || DEFAULT_CARRIER_C,
        attachments: initialAttachments,
        quotation_date: initialData.quotation_date ? initialData.quotation_date.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      if (Array.isArray(initialData.charges)) {
        setCharges(initialData.charges.map(ch => ({
          ...ch,
          currency: ch.currency || initialCurrency
        })));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        quotation_no: generateQuotationNo(existingCount)
      }));
    }
  }, [initialData, existingCount]);

  // Handle Multi-File Attachment Upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingFiles(true);
    setGlobalError('');
    try {
      const fd = new FormData();
      files.forEach((file) => {
        fd.append('attachments', file);
      });

      const res = await exportQuotationService.uploadAttachments(fd);
      const newFiles = res?.data?.data || res?.data || [];
      if (Array.isArray(newFiles)) {
        setFormData(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), ...newFiles]
        }));
      }
    } catch (err) {
      console.error('Failed to upload attachments:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to upload attachments.';
      setGlobalError(msg);
    } finally {
      setIsUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (attIdOrUrl) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(
        att => (att.id || att.file_url) !== attIdOrUrl && att.file_url !== attIdOrUrl
      )
    }));
  };


  // Extract Cargo and Container specifications from Shipping Inquiry object
  const extractInquiryDetails = (inq) => {
    if (!inq) return {};

    // 1. Cargos extraction (supports cargoDetails array, legacy cargos array, or flat fields)
    const cargos = Array.isArray(inq.cargoDetails) && inq.cargoDetails.length > 0
      ? inq.cargoDetails
      : (Array.isArray(inq.cargos) && inq.cargos.length > 0
        ? inq.cargos
        : (inq.cargo ? [inq.cargo] : []));

    let commodity = inq.commodity || '';
    let hsnCode = inq.hsn_code || '';
    let cargoType = inq.cargo_type || 'General';
    let weightValue = '';
    let weightUom = 'KG';
    let grossWeight = inq.gross_weight || inq.weight || '';

    if (cargos.length > 0) {
      if (!commodity) {
        commodity = cargos.map(c => c.commodity || c.commodity_name || c.name).filter(Boolean).join(', ');
      }
      if (!hsnCode) {
        hsnCode = cargos.map(c => c.hsn_code || c.hsn).filter(Boolean).join(', ');
      }
      if (!inq.cargo_type && cargos[0]?.cargo_type) {
        cargoType = cargos[0].cargo_type;
      }

      if (cargos.length === 1) {
        weightValue = (cargos[0].weight_value !== undefined && cargos[0].weight_value !== null) ? String(cargos[0].weight_value) : '';
        weightUom = cargos[0].weight_uom || 'KG';
      } else {
        const totalNum = cargos.reduce((sum, c) => sum + (parseFloat(c.weight_value) || 0), 0);
        weightValue = totalNum > 0 ? String(totalNum) : ((cargos[0].weight_value !== undefined && cargos[0].weight_value !== null) ? String(cargos[0].weight_value) : '');
        weightUom = cargos[0].weight_uom || 'KG';
      }

      if (!grossWeight && weightValue) {
        grossWeight = `${weightValue} ${weightUom}`.trim();
      }
    }

    if (grossWeight && !weightValue) {
      const parsed = parseWeightString(grossWeight);
      weightValue = parsed.val;
      weightUom = parsed.uom || 'KG';
    }

    // 2. Containers extraction (supports containerDetails array, legacy containers array, or flat fields)
    const containers = Array.isArray(inq.containerDetails) && inq.containerDetails.length > 0
      ? inq.containerDetails
      : (Array.isArray(inq.containers) && inq.containers.length > 0
        ? inq.containers
        : (inq.container ? [inq.container] : []));

    let containerQty = 1;
    let containerType = inq.container_type || "20'";

    if (containers.length > 0) {
      containerQty = containers.reduce((sum, c) => sum + (parseInt(c.no_of_containers || c.quantity || '1', 10) || 1), 0);
      if (containers.length === 1) {
        containerType = containers[0].container_type || "20'";
      } else {
        containerType = containers.map(c => `${c.no_of_containers || 1} x ${c.container_type || "20'"}`).join(', ');
      }
    } else if (inq.no_of_containers || inq.quantity) {
      containerQty = parseInt(inq.no_of_containers || inq.quantity || '1', 10) || 1;
    }

    return {
      commodity,
      hsn_code: hsnCode,
      cargo_type: cargoType,
      weight_value: weightValue,
      weight_uom: weightUom || 'KG',
      gross_weight: grossWeight || (weightValue ? `${weightValue} ${weightUom}`.trim() : ''),
      container_type: containerType,
      no_of_containers: String(containerQty),
      containerQty
    };
  };

  // Helper to populate form data from selected inquiry
  const applyInquiryToForm = (selectedInq) => {
    if (!selectedInq) return;

    const details = extractInquiryDetails(selectedInq);

    setFormData(prev => ({
      ...prev,
      inquiry_id: selectedInq.id,
      inquiry_no: selectedInq.inquiry_no,
      exporter_id: selectedInq.exporter_id || selectedInq.customer_id || '',
      exporter_name: selectedInq.exporter_name || selectedInq.customer_name || '',
      pol: selectedInq.pol || selectedInq.origin || '',
      pod: selectedInq.pod || selectedInq.destination || '',
      fpod: selectedInq.fpod || '',
      commodity: details.commodity || prev.commodity || '',
      hsn_code: details.hsn_code || prev.hsn_code || '',
      cargo_type: details.cargo_type || prev.cargo_type || 'General',
      gross_weight: details.gross_weight || prev.gross_weight || '',
      weight_value: details.weight_value || prev.weight_value || '',
      weight_uom: details.weight_uom || prev.weight_uom || 'KG',
      container_type: details.container_type || prev.container_type || "20'",
      no_of_containers: details.no_of_containers || prev.no_of_containers || '1',
      shipment_terms: selectedInq.shipment_terms || 'FOB',
      cargo_ready_date: selectedInq.cargo_ready_date ? selectedInq.cargo_ready_date.split('T')[0] : '',
      stuffing_location: selectedInq.stuffing_location || 'Factory',
      stuffing_location_other: selectedInq.stuffing_location_other || '',
      factory_details: selectedInq.factory_details || null,
      factory_name: selectedInq.factory_name || selectedInq.factory_details?.factory_name || '',
      factory_address: selectedInq.factory_address || selectedInq.factory_details?.factory_address || '',
      factory_city: selectedInq.factory_city || selectedInq.factory_details?.city || '',
      factory_state: selectedInq.factory_state || selectedInq.factory_details?.state || '',
      factory_pincode: selectedInq.factory_pincode || selectedInq.factory_details?.pincode || '',
      factory_contact_person: selectedInq.factory_contact_person || selectedInq.factory_details?.contact_person || '',
      factory_contact_phone: selectedInq.factory_contact_phone || selectedInq.factory_details?.contact_phone || '',
      factory_gstin: selectedInq.factory_gstin || selectedInq.factory_details?.gstin || '',
      shipping_line_preference: selectedInq.shipping_line_preference || '',
      free_days_required: selectedInq.free_days_required !== undefined ? String(selectedInq.free_days_required) : '',
      special_requirements: selectedInq.special_requirements || selectedInq.remarks || ''
    }));

    // Update charges quantities for 'Per Container' basis to match inquiry's container count
    const containerQty = details.containerQty || 1;
    setCharges(prevCharges => 
      prevCharges.map(item => {
        const newQty = item.basis === 'Per Container' ? containerQty : item.quantity;
        const newAmt = item.applicable ? newQty * (Number(item.rate) || 0) : 0;
        return {
          ...item,
          quantity: newQty,
          amount: newAmt
        };
      })
    );
  };

  // Handle Inquiry Selection -> Auto Populate Shipment Fields & Quantities
  const handleInquirySelect = async (e) => {
    const inqId = e.target.value;
    if (!inqId) {
      setFormData(prev => ({
        ...prev,
        inquiry_id: '',
        inquiry_no: ''
      }));
      return;
    }

    const cachedInq = savedInquiries.find(item => String(item.id) === String(inqId) || item.inquiry_no === inqId);
    if (cachedInq) {
      applyInquiryToForm(cachedInq);
    }

    // Also fetch full inquiry details by ID from API to ensure fresh/complete nested associations
    try {
      const res = await shippingInquiryService.getInquiryById(inqId);
      const fullInq = res?.data?.data || res?.data;
      if (fullInq && fullInq.id) {
        applyInquiryToForm(fullInq);
      }
    } catch (err) {
      console.warn('Could not fetch single inquiry details, using list cache:', err);
    }
  };

  // Input Field Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Carrier Option Field Change Handler
  const handleCarrierOptionChange = (optionKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [optionKey]: {
        ...(prev[optionKey] || {}),
        [field]: value
      }
    }));
  };

  // Select Option Action Handler
  const handleSelectCarrierOption = (optionObj) => {
    if (!optionObj || !optionObj.line) return;
    setFormData(prev => ({
      ...prev,
      selected_carrier: optionObj.line || '',
      carrier_selection_notes: `Selected ${optionObj.line || 'Carrier'}${optionObj.freight ? ` (Freight: ${currencySymbol}${optionObj.freight})` : ''}. ${optionObj.notes || ''}`.trim()
    }));

    // Update Ocean Freight charge line rate automatically if rate is present
    if (optionObj.freight) {
      setCharges(prevCharges => 
        prevCharges.map(item => {
          if (item.id === 'ch1' || item.name.includes('Ocean Freight')) {
            const newRate = Number(optionObj.freight) || item.rate;
            return {
              ...item,
              applicable: true,
              rate: newRate,
              amount: item.quantity * newRate
            };
          }
          return item;
        })
      );
    }
  };

  // Charge Line Item Handlers
  const handleChargeToggle = (id) => {
    setCharges(prev => prev.map(c => {
      if (c.id === id) {
        const nextApplicable = !c.applicable;
        return {
          ...c,
          applicable: nextApplicable,
          amount: nextApplicable ? (Number(c.quantity) || 1) * (Number(c.rate) || 0) : 0
        };
      }
      return c;
    }));
  };

  const handleChargeValueChange = (id, field, val) => {
    setCharges(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: val };
        
        if (field === 'name' || field === 'basis' || field === 'currency') {
          return updated;
        }

        const q = field === 'quantity' ? (Number(val) || 0) : (Number(c.quantity) || 0);
        const r = field === 'rate' ? (Number(val) || 0) : (Number(c.rate) || 0);
        
        if (field === 'amount') {
          updated.amount = Number(val) || 0;
        } else {
          updated.quantity = q;
          updated.rate = r;
          updated.amount = c.applicable ? q * r : 0;
        }

        return updated;
      }
      return c;
    }));
  };

  const handleAddChargeLine = (presetCharge = null) => {
    const newId = `ch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setCharges(prev => [
      ...prev,
      {
        id: newId,
        name: presetCharge?.name || presetCharge?.charge_name || '',
        basis: presetCharge?.basis || presetCharge?.uom || 'Per Container',
        currency: formData.currency || presetCharge?.currency || presetCharge?.default_currency || 'INR',
        applicable: true,
        quantity: 1,
        rate: Number(presetCharge?.rate || presetCharge?.default_rate || 0),
        amount: Number(presetCharge?.rate || presetCharge?.default_rate || 0)
      }
    ]);
  };

  const handleRemoveChargeLine = (id) => {
    setCharges(prev => prev.filter(c => c.id !== id));
  };

  const handleResetToMasterCharges = () => {
    setCharges(
      chargeMasters.map(ch => ({
        id: `ch_${ch.id}`,
        name: ch.name,
        basis: ch.basis,
        currency: formData.currency || ch.currency || 'INR',
        applicable: ch.defaultApplicable,
        quantity: ch.quantity || 1,
        rate: ch.rate || 0,
        amount: ch.defaultApplicable ? (ch.quantity || 1) * (ch.rate || 0) : 0
      }))
    );
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    if (!formData.exporter_name && !formData.exporter_id) {
      setGlobalError('Please select or specify an Exporter / Customer.');
      return;
    }

    const finalWeight = formData.weight_value 
      ? `${formData.weight_value} ${formData.weight_uom || 'KG'}`.trim()
      : formData.gross_weight;

    setIsLoading(true);

    try {
      const formattedCharges = charges.map(c => ({
        charge_name: c.name || c.charge_name || 'Charge Head',
        basis: c.basis || 'Per Container',
        currency: formData.currency || c.currency || 'INR',
        applicable: c.applicable !== false,
        quantity: Number(c.quantity) || 1,
        rate: Number(c.rate) || 0,
        amount: c.applicable !== false ? (Number(c.quantity || 1) * Number(c.rate || 0)) : 0,
      }));

      const payload = {
        ...formData,
        currency: formData.currency || 'INR',
        gross_weight: finalWeight,
        charges: formattedCharges,
        total_amount: totalAmount,
      };

      let response;
      if (isEditMode) {
        response = await exportQuotationService.updateQuotation(initialData.id, payload);
      } else {
        response = await exportQuotationService.createQuotation(payload);
      }

      const savedData = response?.data?.data || response?.data;
      onSuccess && onSuccess(savedData);
    } catch (err) {
      console.error('Save Export Quotation error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save export quotation.';
      setGlobalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sectionHeaderStyle = {
    fontSize: '0.875rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--primary, #1976D2)',
    borderBottom: '2px solid #e3f2fd',
    paddingBottom: '0.4rem',
    marginBottom: '0.85rem',
    marginTop: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const carrierA = formData.carrier_option_a || DEFAULT_CARRIER_A;
  const carrierB = formData.carrier_option_b || DEFAULT_CARRIER_B;
  const carrierC = formData.carrier_option_c || DEFAULT_CARRIER_C;

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
      <div className="flex justify-between align-center mb-md border-b-light pb-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
        <div>
          <h2 className="text-lg font-semibold m-0" style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: 600 }}>
            {isEditMode ? `Edit Export Quotation (${formData.quotation_no})` : 'New Export Quotation'}
          </h2>
          <p className="text-xs text-tertiary m-0 mt-xs" style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Link Shipping Inquiry, perform customs verification, evaluate carrier freight options, and calculate quotation charges.
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">Close</Button>
      </div>

      {globalError && (
        <div className="alert alert-danger mb-md p-sm text-sm" style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.75rem 1rem', borderRadius: '6px', borderLeft: '4px solid #ef5350', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* SECTION 1 — HEADER & LINKED SHIPPING INQUIRY */}
        <div style={sectionHeaderStyle}>
          <FileText size={16} color="#1976D2" />
          <span>Section 1 — Header & Linked Shipping Inquiry</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          {/* Quotation No */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Quotation No <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="text"
              name="quotation_no"
              value={formData.quotation_no}
              readOnly
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontWeight: 700, color: '#1976D2' }}
            />
            <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>System Generated (Format: EQUOT/SS/MM-YY/001)</small>
          </div>

          {/* Quotation Date */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Quotation Date <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="date"
              name="quotation_date"
              value={formData.quotation_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            />
          </div>

          {/* Linked Shipping Inquiry Selector */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0288d1', marginBottom: '0.35rem' }}>
              Link Existing Shipping Inquiry <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <select
              name="inquiry_id"
              value={formData.inquiry_id || formData.inquiry_no}
              onChange={handleInquirySelect}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '2px solid #0288d1', backgroundColor: '#f0f9ff' }}
            >
              <option value="">-- Select Inquiry No to Auto-Populate --</option>
              {savedInquiries.map(inq => (
                <option key={inq.id} value={inq.id}>
                  {inq.inquiry_no} — {inq.exporter_name || inq.customer_name} ({inq.pol || inq.origin} → {inq.pod || inq.destination})
                </option>
              ))}
            </select>
            <small style={{ fontSize: '0.75rem', color: '#0288d1' }}>Selecting an Inquiry copies POL, POD, Commodity, HSN, & Containers</small>
          </div>

          {/* Exporter Name */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Exporter / Customer <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="text"
              name="exporter_name"
              value={formData.exporter_name}
              onChange={handleChange}
              placeholder="Exporter Name"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              required
            />
          </div>

        </div>

        {/* SECTION 2 — SHIPMENT SUMMARY (AUTO-FILLED FROM INQUIRY) */}
        <div style={sectionHeaderStyle}>
          <MapPin size={16} color="#1976D2" />
          <span>Section 2 — Shipment Routing & Cargo Specifications</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* POL */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Port of Loading (POL) <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="pol"
              value={formData.pol}
              onChange={handleChange}
              placeholder="e.g. Mundra Port (INMUN)"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* POD */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Port of Discharge (POD) <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="pod"
              value={formData.pod}
              onChange={handleChange}
              placeholder="e.g. Dubai / Jebel Ali (AEJEA)"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* FPOD */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Final Place of Delivery (FPOD) <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="fpod"
              value={formData.fpod}
              onChange={handleChange}
              placeholder="e.g. Destination ICD / Warehouse"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Commodity */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Commodity <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="commodity"
              value={formData.commodity}
              onChange={handleChange}
              placeholder="e.g. Cotton Textiles"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* HSN Code */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>HSN Code <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="hsn_code"
              value={formData.hsn_code}
              onChange={handleChange}
              placeholder="e.g. 5205.12"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Container Type */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Container Requirement <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="container_type"
              value={formData.container_type}
              onChange={handleChange}
              placeholder="e.g. 40' HC"
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* No of Containers */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>No. of Containers <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="number"
              min="1"
              name="no_of_containers"
              value={formData.no_of_containers}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          {/* Gross Weight with UOM Master Dropdown */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Gross Weight <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                name="weight_value"
                value={formData.weight_value || ''}
                onChange={handleChange}
                placeholder="e.g. 24000"
                style={{ width: '60%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
              <select
                name="weight_uom"
                value={formData.weight_uom || 'KG'}
                onChange={handleChange}
                style={{ width: '40%', padding: '0.45rem 0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontWeight: 600, backgroundColor: '#f8fafc' }}
              >
                {uoms.map(u => {
                  const code = u.uom_code || u.code || u.uom_name || u.name || 'KG';
                  const label = u.uom_name || u.name || code;
                  return (
                    <option key={u.id || code} value={code}>
                      {code} ({label})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Shipment Terms */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Shipment Terms <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span></label>
            <select
              name="shipment_terms"
              value={formData.shipment_terms}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="FOB">FOB — Free On Board</option>
              <option value="CIF">CIF — Cost, Insurance & Freight</option>
              <option value="CFR">CFR — Cost & Freight</option>
              <option value="EXW">EXW — Ex Works</option>
            </select>
          </div>
        </div>

        {/* SECTION 3 — PRE-QUOTATION CUSTOMS VERIFICATION CHECKLIST */}
        <div style={sectionHeaderStyle}>
          <ShieldCheck size={16} color="#1976D2" />
          <span>Section 3 — Pre-Quotation Customs & Restriction Verification</span>
        </div>
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            {/* Customs Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Customs Check Status</label>
              <select
                name="customs_verification_status"
                value={formData.customs_verification_status}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Checked & Verified">Checked & Verified</option>
                <option value="Pending Check">Pending Check</option>
              </select>
            </div>

            {/* Commodity Verification */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Commodity Verification</label>
              <select
                name="customs_commodity_checked"
                value={formData.customs_commodity_checked}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Yes">Verified (Matches Description)</option>
                <option value="No">Pending Inspection</option>
              </select>
            </div>

            {/* Cargo Photos */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Cargo Photos Check</label>
              <select
                name="customs_cargo_photos"
                value={formData.customs_cargo_photos}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Available">Available & Verified</option>
                <option value="Not Available">Not Available</option>
                <option value="Pending">Requested from Exporter</option>
              </select>
            </div>

            {/* HSN Verification */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>HSN Code Check</label>
              <select
                name="customs_hsn_status"
                value={formData.customs_hsn_status}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Verified">Verified on ICEGATE</option>
                <option value="Requires Clarification">Requires Clarification</option>
              </select>
            </div>

            {/* ICEGATE / DGFT Restriction */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>DGFT / ICEGATE Restrictions</label>
              <select
                name="customs_restrictions"
                value={formData.customs_restrictions}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="None">None (Free Export)</option>
                <option value="Restricted / License Required">Restricted / Export License Req.</option>
                <option value="Special Clearance Needed">Special Approval / Test Cert Req.</option>
              </select>
            </div>

          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Customs Verification Notes</label>
            <input
              type="text"
              name="customs_notes"
              value={formData.customs_notes}
              onChange={handleChange}
              placeholder="e.g. Checked ICEGATE portal for RODTEP eligibility & DGFT notification restrictions..."
              style={{ width: '100%', padding: '0.4rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* SECTION 4 — FREIGHT & CARRIER COMPARISON ENGINE */}
        <div style={sectionHeaderStyle}>
          <Ship size={16} color="#1976D2" />
          <span>Section 4 — Shipping Line Freight Rates & Carrier Comparison</span>
        </div>

        {/* Informative Note for Carrier Options */}
        <div
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            padding: '0.5rem 0.85rem',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: '#0369a1',
          }}
        >
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Carrier Rate Comparison:</strong> Enter quotes from up to 3 shipping lines to compare freight rates & transit times, then click <strong>"Select"</strong> on your chosen option. If you only have one carrier, simply fill <strong>Carrier Option A</strong> and click <strong>"Select Option A"</strong>.
          </span>
        </div>
        
        {(() => {
          const isOptionASelected = Boolean(carrierA.line && formData.selected_carrier === carrierA.line);
          const isOptionBSelected = Boolean(carrierB.line && formData.selected_carrier === carrierB.line);
          const isOptionCSelected = Boolean(carrierC.line && formData.selected_carrier === carrierC.line);

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              
              {/* OPTION A */}
              <div style={{ border: isOptionASelected ? '2px solid #0288d1' : '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: isOptionASelected ? '#f0f9ff' : '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0288d1' }}>Carrier Option A</strong>
                  <Button
                    type="button"
                    variant={isOptionASelected ? "primary" : "outline"}
                    size="sm"
                    disabled={!carrierA.line}
                    onClick={() => handleSelectCarrierOption(carrierA)}
                  >
                    {isOptionASelected ? "Selected" : "Select Option A"}
                  </Button>
                </div>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="Shipping Line (e.g. Maersk Line)"
                    value={carrierA.line}
                    onChange={(e) => handleCarrierOptionChange('carrier_option_a', 'line', e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="number"
                      placeholder={`Freight Rate (${currencySymbol})`}
                      value={carrierA.freight}
                      onChange={(e) => handleCarrierOptionChange('carrier_option_a', 'freight', e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <input
                      type="number"
                      placeholder={`Local Charges (${currencySymbol})`}
                      value={carrierA.local}
                      onChange={(e) => handleCarrierOptionChange('carrier_option_a', 'local', e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Direct weekly service, 14 days transit"
                    value={carrierA.notes}
                    onChange={(e) => handleCarrierOptionChange('carrier_option_a', 'notes', e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  />
                </div>
              </div>

              {/* OPTION B */}
              <div style={{ border: isOptionBSelected ? '2px solid #0288d1' : '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: isOptionBSelected ? '#f0f9ff' : '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0288d1' }}>Carrier Option B</strong>
                  <Button
                    type="button"
                    variant={isOptionBSelected ? "primary" : "outline"}
                    size="sm"
                    disabled={!carrierB.line}
                    onClick={() => handleSelectCarrierOption(carrierB)}
                  >
                    {isOptionBSelected ? "Selected" : "Select Option B"}
                  </Button>
                </div>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="Shipping Line (e.g. MSC Line)"
                    value={carrierB.line}
                    onChange={(e) => handleCarrierOptionChange('carrier_option_b', 'line', e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="number"
                      placeholder={`Freight Rate (${currencySymbol})`}
                      value={carrierB.freight}
                      onChange={(e) => handleCarrierOptionChange('carrier_option_b', 'freight', e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <input
                      type="number"
                      placeholder={`Local Charges (${currencySymbol})`}
                      value={carrierB.local}
                      onChange={(e) => handleCarrierOptionChange('carrier_option_b', 'local', e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Transshipment via Colombo, 18 days transit"
                    value={carrierB.notes}
                    onChange={(e) => handleCarrierOptionChange('carrier_option_b', 'notes', e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  />
                </div>
              </div>

              {/* OPTION C */}
              <div style={{ border: isOptionCSelected ? '2px solid #0288d1' : '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: isOptionCSelected ? '#f0f9ff' : '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0288d1' }}>Carrier Option C</strong>
                  <Button
                    type="button"
                    variant={isOptionCSelected ? "primary" : "outline"}
                    size="sm"
                    disabled={!carrierC.line}
                    onClick={() => handleSelectCarrierOption(carrierC)}
                  >
                    {isOptionCSelected ? "Selected" : "Select Option C"}
                  </Button>
                </div>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="Shipping Line (e.g. CMA CGM / Hapag)"
                    value={carrierC.line}
                    onChange={(e) => handleCarrierOptionChange('carrier_option_c', 'line', e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="number"
                      placeholder={`Freight Rate (${currencySymbol})`}
                      value={carrierC.freight}
                      onChange={(e) => handleCarrierOptionChange('carrier_option_c', 'freight', e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <input
                      type="number"
                      placeholder={`Local Charges (${currencySymbol})`}
                      value={carrierC.local}
                      onChange={(e) => handleCarrierOptionChange('carrier_option_c', 'local', e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '50%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Direct service, strong local equipment"
                    value={carrierC.notes}
                    onChange={(e) => handleCarrierOptionChange('carrier_option_c', 'notes', e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  />
                </div>
              </div>

            </div>
          );
        })()}

        {/* Selected Carrier Rationale */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Selected Shipping Line / Carrier</label>
            <input
              type="text"
              name="selected_carrier"
              placeholder="e.g. Maersk Line / MSC / CMA CGM"
              value={formData.selected_carrier}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db', fontWeight: 700, color: '#0288d1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>Carrier Selection Rationale</label>
            <input
              type="text"
              name="carrier_selection_notes"
              value={formData.carrier_selection_notes}
              onChange={handleChange}
              placeholder="e.g. Selected Option A for optimal transit time & reliability on sector..."
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
        </div>

        {/* SECTION 5 — CLIENT QUOTATION CHARGE LINE ITEMS (CHARGES ENGINE) */}
        <div style={sectionHeaderStyle}>
          <Calculator size={16} color="#1976D2" />
          <span>Section 5 — Client Quotation Charge Line Items (Charge Master Engine)</span>
        </div>

        {/* Master Toolbar: Quick Add (Left), Currency Dropdown & Reset (Right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Left: Quick Add From Charge Master */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Quick Add From Charge Master:</span>
            <select
              style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#f8fafc' }}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const found = chargeMasters.find(cm => String(cm.id) === String(val) || cm.name === val);
                if (found) {
                  handleAddChargeLine(found);
                }
                e.target.value = '';
              }}
            >
              <option value="">-- Pick Charge Head to Add --</option>
              {chargeMasters.map((cm, i) => (
                <option key={cm.id || i} value={cm.id || cm.name}>
                  {cm.name} ({cm.basis}) - {currencySymbol}{cm.rate}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Quotation Currency Dropdown + Reset Default Charges Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Quotation Currency:</span>
              <select
                name="currency"
                value={formData.currency || 'INR'}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b'
                }}
              >
                {currencies.map(curr => {
                  const code = curr.currency_code || curr.code || 'INR';
                  const symbol = curr.symbol || code;
                  const name = curr.currency_name || curr.name || code;
                  return (
                    <option key={curr.id || code} value={code}>
                      {code} ({symbol}) — {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetToMasterCharges}
              leftIcon={RotateCcw}
              style={{ fontSize: '0.78rem' }}
            >
              Reset Default Charges
            </Button>
          </div>

        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem', textAlign: 'center', width: '45px' }}>Apply</th>
                <th style={{ padding: '0.6rem', width: '36%' }}>Charge / Service Description</th>
                <th style={{ padding: '0.6rem', width: '20%' }}>Basis / Unit</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', width: '10%' }}>Quantity</th>
                <th style={{ padding: '0.6rem', textAlign: 'right', width: '15%' }}>Rate ({currencySymbol})</th>
                <th style={{ padding: '0.6rem', textAlign: 'right', width: '15%' }}>Amount ({currencySymbol})</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', width: '45px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: item.applicable ? '#ffffff' : '#f8fafc' }}>
                  
                  {/* Applicable Checkbox (tabIndex -1 so Tab skips to Quantity/Rate) */}
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      tabIndex={-1}
                      checked={item.applicable}
                      onChange={() => handleChargeToggle(item.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>

                  {/* Charge Name (tabIndex -1) */}
                  <td style={{ padding: '0.4rem' }}>
                    <input
                      type="text"
                      tabIndex={-1}
                      disabled={!item.applicable}
                      value={item.name || ''}
                      onChange={(e) => handleChargeValueChange(item.id, 'name', e.target.value)}
                      placeholder="e.g. Ocean Freight / THC / BL Charges"
                      style={{
                        width: '100%',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem',
                        fontWeight: item.applicable ? 600 : 400,
                        color: item.applicable ? '#0f172a' : '#94a3b8',
                        backgroundColor: item.applicable ? '#ffffff' : '#f1f5f9'
                      }}
                    />
                  </td>

                  {/* Basis / Unit (tabIndex -1) */}
                  <td style={{ padding: '0.4rem' }}>
                    <select
                      tabIndex={-1}
                      disabled={!item.applicable}
                      value={item.basis || 'Per Container'}
                      onChange={(e) => handleChargeValueChange(item.id, 'basis', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        color: item.applicable ? '#334155' : '#94a3b8',
                        backgroundColor: item.applicable ? '#ffffff' : '#f1f5f9'
                      }}
                    >
                      <option value="Per Container">Per Container</option>
                      <option value="Per BL Set">Per BL Set</option>
                      <option value="Flat / Lump sum">Flat / Lump sum</option>
                      <option value="Per Vehicle">Per Vehicle</option>
                      <option value="Per Set">Per Set</option>
                      <option value="Per CBM">Per CBM</option>
                      <option value="Per MT">Per MT</option>
                      <option value="Per KG">Per KG</option>
                      <option value="Per Document">Per Document</option>
                      <option value="Per Day">Per Day</option>
                    </select>
                  </td>

                  {/* Quantity Input (Active in Tab sequence) */}
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      tabIndex={item.applicable ? 0 : -1}
                      disabled={!item.applicable}
                      value={item.quantity}
                      onChange={(e) => handleChargeValueChange(item.id, 'quantity', e.target.value)}
                      style={{
                        width: '65px',
                        padding: '0.3rem 0.25rem',
                        textAlign: 'center',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem'
                      }}
                    />
                  </td>

                  {/* Rate Input (Active in Tab sequence) */}
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: item.applicable ? '#ffffff' : '#f1f5f9',
                        padding: '0 0.4rem 0 0.2rem'
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        tabIndex={item.applicable ? 0 : -1}
                        disabled={!item.applicable}
                        value={item.rate}
                        onChange={(e) => handleChargeValueChange(item.id, 'rate', e.target.value)}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '0.3rem 0.2rem',
                          textAlign: 'right',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          color: '#0f172a'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#64748b',
                          marginLeft: '0.2rem',
                          userSelect: 'none',
                          pointerEvents: 'none'
                        }}
                      >
                        {currencySymbol}
                      </span>
                    </div>
                  </td>

                  {/* Amount Input (tabIndex -1 so Tab key jumps straight to next line's Quantity) */}
                  <td style={{ padding: '0.4rem', textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: item.applicable ? '#f8fafc' : '#f1f5f9',
                        padding: '0 0.4rem 0 0.2rem'
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        tabIndex={-1}
                        disabled={!item.applicable}
                        value={item.amount}
                        onChange={(e) => handleChargeValueChange(item.id, 'amount', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.3rem 0.2rem',
                          textAlign: 'right',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: item.applicable ? '#2e7d32' : '#94a3b8'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: item.applicable ? '#2e7d32' : '#64748b',
                          marginLeft: '0.2rem',
                          userSelect: 'none',
                          pointerEvents: 'none'
                        }}
                      >
                        {currencySymbol}
                      </span>
                    </div>
                  </td>

                  {/* Remove Button (tabIndex -1) */}
                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => handleRemoveChargeLine(item.id)}
                      title="Remove Charge Line"
                      style={{
                        border: 'none',
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '0.35rem 0.45rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}>
                <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.95rem' }}>
                  GRAND TOTAL ESTIMATED CHARGES ({currencyCode}):
                </td>
                <td colSpan="2" style={{ padding: '0.75rem', textAlign: 'right', fontSize: '1.2rem', color: '#0288d1' }}>
                  {currencySymbol} {Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Action Bar for Adding New Custom Lines */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.75rem', marginBottom: '1.5rem' }}>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleAddChargeLine()}
            leftIcon={Plus}
            style={{ fontSize: '0.825rem' }}
          >
            Add Custom Charge Line
          </Button>
        </div>

        {/* SECTION 6 — STATUS & REMARKS */}
        <div style={sectionHeaderStyle}>
          <FileText size={16} color="#1976D2" />
          <span>Section 6 — Lifecycle Status & Instructions</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          
          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Quotation Lifecycle Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="Draft">Draft</option>
              <option value="Prepared">Prepared / Ready</option>
              <option value="Sent">Sent to Exporter</option>
              <option value="Accepted">Accepted (Ready for Booking)</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

        </div>

        {/* Special Instructions */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Special Quotation Notes / Instructions</label>
          <textarea
            name="special_requirements"
            rows="3"
            value={formData.special_requirements}
            onChange={handleChange}
            placeholder="Add special terms, validity dates, equipment conditions..."
            style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '4px', border: '1px solid #d1d5db', resize: 'vertical' }}
          />
        </div>

        {/* SECTION 7 — ATTACHMENTS & SUPPORTING DOCUMENTS */}
        <div style={sectionHeaderStyle}>
          <Paperclip size={16} color="#1976D2" />
          <span>Section 7 — Attachments & Supporting Documents</span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.svg,.webp"
            style={{ display: 'none' }}
          />

          {/* Upload Drop / Browse Area */}
          <div
            onClick={() => !isUploadingFiles && fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: '2px dashed #93c5fd',
              borderRadius: '8px',
              padding: '1.25rem 1.5rem',
              backgroundColor: '#f8fafc',
              textAlign: 'center',
              cursor: isUploadingFiles ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            {isUploadingFiles ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0288d1', fontWeight: 600 }}>
                <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Uploading attachment(s) to uploads folder...</span>
              </div>
            ) : (
              <>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0288d1', marginBottom: '0.2rem' }}>
                  <Upload size={22} />
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                  Click to browse or drop files to attach
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Add as many documents as needed (PDF, Word, Excel, CSV, Images). All files are stored directly in the <strong>uploads</strong> folder.
                </div>
              </>
            )}
          </div>

          {/* Attached Files List / Grid */}
          {formData.attachments && formData.attachments.length > 0 ? (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Attached Files ({formData.attachments.length}):</span>
                <span style={{ fontSize: '0.75rem', color: '#0288d1', fontWeight: 500 }}>Showing active files for this quotation</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {formData.attachments.map((file, idx) => {
                  const fileName = file.name || file.filename || `Attachment_${idx + 1}`;
                  const fileUrl = getFullFileUrl(file.file_url);
                  const fileSize = formatFileSize(file.size);
                  const uploadDate = file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString('en-GB') : '';

                  return (
                    <div
                      key={file.id || file.file_url || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                        <div style={{ flexShrink: 0 }}>
                          {getFileIcon(file.mimetype, fileName)}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            title={fileName}
                            style={{
                              fontSize: '0.825rem',
                              fontWeight: 600,
                              color: '#1e293b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fileName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {fileSize} {uploadDate ? `• ${uploadDate}` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open / Download Attachment"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.35rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: '#e0f2fe',
                            color: '#0288d1',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                          }}
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(file.id || file.file_url)}
                          title="Remove Attachment"
                          style={{
                            border: 'none',
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '0.35rem 0.45rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>
              No attachments uploaded yet. You can attach invoices, packing lists, rate confirmations, or cargo photos.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading || isUploadingFiles}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading || isUploadingFiles} isLoading={isLoading} leftIcon={Check}>
            {isEditMode ? 'Update Export Quotation' : 'Save Export Quotation'}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default QuotationForm;

