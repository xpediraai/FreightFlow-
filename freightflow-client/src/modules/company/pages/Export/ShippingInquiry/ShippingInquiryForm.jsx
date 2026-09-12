import React, { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  X,
  Check,
  Building2,
  MapPin,
  Package,
  Box,
  FileText,
  Calendar,
  Ship,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import Button from '../../../../../shared/components/Button';
import { businessService } from '../../../../masters/services/business.service';
import { logisticsService } from '../../../../masters/services/logistics.service';
import { commonService } from '../../../../masters/services/common.service';
import FactorySelectionModal from './FactorySelectionModal';
import FloatingWrapper from '../../../../../shared/components/FloattingWrapper/FloatingWrapper';
import { shippingInquiryService } from './shippingInquiry.service';

// ============================================================
// Helpers
// ============================================================

export const generateInquiryNo = (existingCount = 0) => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const seq = String(existingCount + 1).padStart(3, '0');
  return `ESI/SS/${month}-${year}/${seq}`;
};

export const parseWeightString = (str = '') => {
  if (!str) return { val: '', uom: 'KG' };
  const cleaned = String(str).trim();
  const match = cleaned.match(/^([\d.,]+)\s*([A-Za-z]+)?$/);
  if (match) {
    return {
      val: match[1] || '',
      uom: (match[2] || 'KG').toUpperCase(),
    };
  }
  return { val: cleaned, uom: 'KG' };
};

const extractList = (res) => {
  if (res?.status !== 'fulfilled' || !res.value) return [];
  const data =
    res.value?.data?.data?.data ||
    res.value?.data?.data ||
    res.value?.data;
  return Array.isArray(data) ? data : [];
};

const portLabel = (p) =>
  typeof p === 'object' ? p.port_name || p.name || p.port_code || '' : String(p || '');

const getExporterName = (exp) =>
  exp?.customer_name || exp?.name || exp?.company_name || '';

// ============================================================
// Defaults (fallback when API is empty)
// ============================================================

const DEFAULT_EXPORTERS = [
  { id: 'c1', customer_name: 'Apex Global Logistics Ltd' },
  { id: 'c2', customer_name: 'Sunlight Exports & Trading' },
  { id: 'c3', customer_name: 'Gujarat Textiles Pvt Ltd' },
  { id: 'c4', customer_name: 'Orient Shipping & Freight Corp' },
];

const DEFAULT_PORTS = [
  { id: 'p1', port_name: 'Mundra Port (INMUN)', port_code: 'INMUN' },
  { id: 'p2', port_name: 'Nhava Sheva / JNPT (INNSA)', port_code: 'INNSA' },
  { id: 'p3', port_name: 'Hazira Port (INHZR)', port_code: 'INHZR' },
  { id: 'p4', port_name: 'Kandla Port (IXY)', port_code: 'IXY' },
  { id: 'p5', port_name: 'Dubai / Jebel Ali (AEJEA)', port_code: 'AEJEA' },
  { id: 'p6', port_name: 'Rotterdam (NLRTM)', port_code: 'NLRTM' },
  { id: 'p7', port_name: 'Singapore (SGSIN)', port_code: 'SGSIN' },
  { id: 'p8', port_name: 'Hamburg (DEHAM)', port_code: 'DEHAM' },
  { id: 'p9', port_name: 'New York / New Jersey (USNYC)', port_code: 'USNYC' },
  { id: 'p10', port_name: 'Shanghai (CNSHA)', port_code: 'CNSHA' },
];

const DEFAULT_SHIPPING_LINES = [
  { id: 'sl1', name: 'Maersk Line' },
  { id: 'sl2', name: 'MSC (Mediterranean Shipping Company)' },
  { id: 'sl3', name: 'CMA CGM' },
  { id: 'sl4', name: 'Hapag-Lloyd' },
  { id: 'sl5', name: 'ONE (Ocean Network Express)' },
  { id: 'sl6', name: 'COSCO Shipping' },
];

const DEFAULT_CONTAINER_TYPES = [
  { id: 'ct1', container_code: "20'", container_name: "20' Standard Dry (20GP)" },
  { id: 'ct2', container_code: "40'", container_name: "40' Standard Dry (40GP)" },
  { id: 'ct3', container_code: "40' HC", container_name: "40' High Cube (40HC)" },
  { id: 'ct4', container_code: "20' RF", container_name: "20' Reefer Container" },
  { id: 'ct5', container_code: "40' RF", container_name: "40' Reefer Container" },
  { id: 'ct6', container_code: "20' OT", container_name: "20' Open Top" },
  { id: 'ct7', container_code: "40' FR", container_name: "40' Flat Rack" },
];

const DEFAULT_UOMS = [
  { id: 'uom_1', uom_code: 'KG', uom_name: 'Kilograms (KG)' },
  { id: 'uom_2', uom_code: 'MT', uom_name: 'Metric Tonnes (MT)' },
  { id: 'uom_3', uom_code: 'LBS', uom_name: 'Pounds (LBS)' },
  { id: 'uom_4', uom_code: 'CBM', uom_name: 'Cubic Meters (CBM)' },
  { id: 'uom_5', uom_code: 'PCS', uom_name: 'Pieces (PCS)' },
];

const emptyCargo = () => ({
  commodity: '',
  hsn_code: '',
  cargo_type: 'General',
  weight_value: '',
  weight_uom: 'KG',
});

const emptyContainer = () => ({
  container_type: "20'",
  no_of_containers: '1',
});

const buildDefaultValues = (initialData, existingCount) => {
  if (!initialData) {
    return {
      inquiry_no: generateInquiryNo(existingCount),
      exporter_id: '',
      exporter_name: '',
      pol: '',
      pod: '',
      fpod: '',
      shipment_type: '',
      shipment_sub_type: '',
      shipment_terms: 'FOB',
      cargo_ready_date: '',
      stuffing_location: 'Factory',
      stuffing_location_other: '',
      factory_name: '',
      factory_address: '',
      factory_contact_person: '',
      shipping_line_preference: '',
      free_days_required: '',
      special_requirements: '',
      inspections: '',
      certifications: '',
      fumigations: '',
      loading_unloading: '',
      palletization: '',
      lashing_chocking: '',
      priority: 'Medium',
      status: 'Pending',
      cargoDetails: [emptyCargo()],
      containerDetails: [emptyContainer()]
    };
  }

  const rawWeight = initialData.gross_weight || initialData.weight || '';
  const parsedWeight = parseWeightString(rawWeight);

  // Prefer nested cargoDetails; fall back to legacy flat fields
  let cargoDetails = Array.isArray(initialData.cargoDetails) && initialData.cargoDetails.length
    ? initialData.cargoDetails.map((c) => ({
      commodity: c.commodity || '',
      hsn_code: c.hsn_code || '',
      cargo_type: c.cargo_type || 'General',
      weight_value: c.weight_value ?? parsedWeight.val,
      weight_uom: c.weight_uom || parsedWeight.uom || 'KG',
    }))
    : [
      {
        commodity: initialData.commodity || '',
        hsn_code: initialData.hsn_code || '',
        cargo_type: initialData.cargo_type || 'General',
        weight_value: parsedWeight.val,
        weight_uom: parsedWeight.uom || 'KG',
      },
    ];
  const containerDetails =
    Array.isArray(initialData.containerDetails) &&
      initialData.containerDetails.length
      ? initialData.containerDetails.map((c) => ({
        container_type: c.container_type || "20'",
        no_of_containers: String(c.no_of_containers || c.quantity || '1'),
      }))
      : [
        {
          container_type: initialData.container_type || "20'",
          no_of_containers: String(
            initialData.no_of_containers || initialData.quantity || '1'
          ),
        },
      ];
  return {
    inquiry_no: initialData.inquiry_no || generateInquiryNo(existingCount),
    exporter_id: initialData.exporter_id || initialData.customer_id || '',
    exporter_name: initialData.exporter_name || initialData.customer_name || '',
    pol: initialData.pol || initialData.origin || '',
    pod: initialData.pod || initialData.destination || '',
    fpod: initialData.fpod || '',
    shipment_type: initialData.shipment_type || '',
    shipment_sub_type: initialData.shipment_sub_type || '',
    shipment_terms: initialData.shipment_terms || 'FOB',
    cargo_ready_date: initialData.cargo_ready_date
      ? String(initialData.cargo_ready_date).split('T')[0]
      : '',
    stuffing_location: initialData.stuffing_location || 'Factory',
    stuffing_location_other: initialData.stuffing_location_other || '',
    factory_name: initialData.factory_name || initialData.factory_details?.factory_name || '',
    factory_address: initialData.factory_address || initialData.factory_details?.factory_address || '',
    factory_contact_person: initialData.factory_contact_person || initialData.factory_details?.contact_person || '',
    shipping_line_preference: initialData.shipping_line_preference || '',
    free_days_required:
      initialData.free_days_required !== undefined &&
        initialData.free_days_required !== null
        ? String(initialData.free_days_required)
        : '',
    special_requirements:
      initialData.special_requirements || initialData.remarks || '',
    inspections: initialData.inspections || '',
    certifications: initialData.certifications || '',
    fumigations: initialData.fumigations || '',
    loading_unloading: initialData.loading_unloading || '',
    palletization: initialData.palletization || '',
    lashing_chocking: initialData.lashing_chocking || '',
    priority: initialData.priority || 'Medium',
    status: initialData.status || 'Pending',
    cargoDetails,
    containerDetails
  };
};

// ============================================================
// Styles (kept minimal / consistent with original)
// ============================================================

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '0.85rem 1.15rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.65rem',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '0.45rem',
  },
  title: { margin: 0, fontSize: '1.15rem', color: '#111827', fontWeight: 600 },
  subtitle: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: '0.15rem',
  },
  sectionHeader: {
    fontSize: '0.825rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--text-primary, #1976D2)',
    borderBottom: '2px solid #e3f2fd',
    paddingBottom: '0.25rem',
    marginBottom: '0.5rem',
    marginTop: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.75rem',
  },
  gridSm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.75rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 500,
    marginBottom: '0.2rem',
  },
  input: {
    width: '100%',
    padding: '0.35rem 0.55rem',
    fontSize: '0.85rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
  },
  inputReadonly: {
    width: '100%',
    padding: '0.35rem 0.55rem',
    fontSize: '0.85rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    backgroundColor: '#f9fafb',
    fontWeight: 600,
    color: '#1976D2',
  },
  error: { color: '#d32f2f', fontSize: '0.72rem', marginTop: '0.15rem' },
  required: { color: '#d32f2f' },
  optional: { color: '#6b7280', fontSize: '0.72rem' },
  alert: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '0.5rem 0.85rem',
    borderRadius: '6px',
    borderLeft: '4px solid #ef5350',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  cargoCard: {
    marginBottom: '0.65rem',
    padding: '0.65rem 0.85rem',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    backgroundColor: '#f5f5f5',
  },
  cargoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem',
  },
  removeBtn: {
    border: 'none',
    background: '#fee2e2',
    color: '#dc2626',
    padding: '0.4rem 0.7rem',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  addCargoBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    border: '1px dashed #1976D2',
    background: '#f0f7ff',
    color: '#1976D2',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e0e0e0',
  },
};

// ============================================================
// Component
// ============================================================

const ShippingInquiryForm = ({
  onCancel,
  onSuccess,
  initialData,
  existingCount = 0,
}) => {
  const isEditMode = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownsLoading, setIsDropdownsLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isFactoryModalOpen, setIsFactoryModalOpen] = useState(false);
  const [factoryDetails, setFactoryDetails] = useState(() => {
    return initialData?.factory_details || (initialData?.factory_name ? {
      factory_name: initialData.factory_name || '',
      factory_address: initialData.factory_address || '',
      city: initialData.factory_city || initialData.city || '',
      state: initialData.factory_state || initialData.state || 'Gujarat',
      pincode: initialData.factory_pincode || initialData.pincode || '',
      contact_person: initialData.factory_contact_person || initialData.contact_person || '',
      contact_phone: initialData.factory_contact_phone || initialData.contact_phone || '',
      gstin: initialData.factory_gstin || initialData.gstin || ''
    } : null);
  });

  const [exporters, setExporters] = useState(DEFAULT_EXPORTERS);
  const [ports, setPorts] = useState(DEFAULT_PORTS);
  const [shippingLines, setShippingLines] = useState(DEFAULT_SHIPPING_LINES);
  const [containerTypes, setContainerTypes] = useState(DEFAULT_CONTAINER_TYPES);
  const [uoms, setUoms] = useState(DEFAULT_UOMS);
  const [transportModes, setTransportModes] = useState([]);

  const defaultValues = useMemo(
    () => buildDefaultValues(initialData, existingCount),
    // Only rebuild when identity of edit record / count changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialData?.id, existingCount]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cargoDetails',
  });

  const {
    fields: containerFields,
    append: appendContainer,
    remove: removeContainer,
  } = useFieldArray({
    control,
    name: 'containerDetails',
  });

  const stuffingLocation = watch('stuffing_location');
  const pol = watch('pol');
  const pod = watch('pod');
  const exporterId = watch('exporter_id');

  // Keep exporter_name in sync when exporter_id changes
  useEffect(() => {
    if (!exporterId) {
      setValue('exporter_name', '');
      return;
    }
    const selected = exporters.find((c) => String(c.id) === String(exporterId));
    setValue('exporter_name', selected ? getExporterName(selected) : '');
  }, [exporterId, exporters, setValue]);

  // Reset form when switching create/edit record
  useEffect(() => {
    reset(buildDefaultValues(initialData, existingCount));
  }, [initialData, existingCount, reset]);

  // Master dropdowns
  useEffect(() => {
    let cancelled = false;

    const loadMasters = async () => {
      setIsDropdownsLoading(true);
      try {
        const results = await Promise.allSettled([
          businessService.getCustomers(),
          logisticsService.getPorts(),
          logisticsService.getShippingLines(),
          commonService.getContainerTypes(),
          commonService.getUOMs(),
          commonService.getTransportModes(),
        ]);

        if (cancelled) return;

        const [custRes, portRes, shipLineRes, containerTypeRes, uomRes, transportModeRes] =
          results;

        const custData = extractList(custRes);
        if (custData.length) setExporters(custData);

        const portData = extractList(portRes);
        let localPorts = [];
        try {
          const local = localStorage.getItem('freightflow_ports');
          if (local) localPorts = JSON.parse(local);
        } catch (e) { }

        let mergedPorts = [];
        if (portData.length > 0) {
          mergedPorts = portData;
          if (localPorts.length > 0) {
            const existingNames = new Set(portData.map(p => portLabel(p).toLowerCase()));
            const newLocal = localPorts.filter(p => !existingNames.has(portLabel(p).toLowerCase()));
            mergedPorts = [...mergedPorts, ...newLocal];
          }
        } else if (localPorts.length > 0) {
          mergedPorts = localPorts;
        } else {
          mergedPorts = DEFAULT_PORTS;
        }

        const existingPortLabels = new Set(mergedPorts.map(p => portLabel(p).toLowerCase()));
        const missingDefaultPorts = DEFAULT_PORTS.filter(p => !existingPortLabels.has(portLabel(p).toLowerCase()));
        mergedPorts = [...mergedPorts, ...missingDefaultPorts];
        setPorts(mergedPorts);

        const lineData = extractList(shipLineRes);
        if (lineData.length) setShippingLines(lineData);

        const contData = extractList(containerTypeRes);
        let localContTypes = [];
        try {
          const local = localStorage.getItem('freightflow_container_types');
          if (local) localContTypes = JSON.parse(local);
        } catch (e) { }

        let mergedContainerTypes = [];
        if (contData.length > 0) {
          mergedContainerTypes = contData;
          if (localContTypes.length > 0) {
            const existingCodes = new Set(contData.map(c => String(c.container_code || c.code || c.container_name || '').toLowerCase()));
            const newLocal = localContTypes.filter(c => !existingCodes.has(String(c.container_code || c.code || c.container_name || '').toLowerCase()));
            mergedContainerTypes = [...mergedContainerTypes, ...newLocal];
          }
        } else if (localContTypes.length > 0) {
          mergedContainerTypes = localContTypes;
        } else {
          mergedContainerTypes = DEFAULT_CONTAINER_TYPES;
        }

        const existingContainerCodes = new Set(mergedContainerTypes.map(c => String(c.container_code || c.code || c.container_name || '').toLowerCase()));
        const missingContainerDefaults = DEFAULT_CONTAINER_TYPES.filter(c => !existingContainerCodes.has(String(c.container_code || c.code || c.container_name || '').toLowerCase()));
        mergedContainerTypes = [...mergedContainerTypes, ...missingContainerDefaults];

        setContainerTypes(mergedContainerTypes);

        const uomData = extractList(uomRes);
        if (uomData.length) setUoms(uomData);

        let tmData = extractList(transportModeRes);
        try {
          const local = localStorage.getItem('freightflow_transport_modes');
          if (local) {
            const localList = JSON.parse(local);
            if (Array.isArray(localList) && localList.length > 0) {
              const backendCodes = new Set(tmData.map(m => String(m.mode_code || m.id).toLowerCase()));
              const newLocal = localList.filter(m => !backendCodes.has(String(m.mode_code || m.id).toLowerCase()));
              tmData = [...newLocal, ...tmData];
            }
          }
        } catch (e) { }

        if (!tmData || tmData.length === 0) {
          tmData = [
            { id: 'tm_1', mode_code: 'AIR', mode_name: 'Air Freight' },
            { id: 'tm_2', mode_code: 'SEA', mode_name: 'Ocean Freight (FCL/LCL)' },
            { id: 'tm_3', mode_code: 'ROAD', mode_name: 'Road / Land Transport' },
            { id: 'tm_4', mode_code: 'RAIL', mode_name: 'Rail Freight' }
          ];
        }
        setTransportModes(tmData);
      } catch (err) {
        console.error('Error fetching master dropdowns:', err);
      } finally {
        if (!cancelled) setIsDropdownsLoading(false);
      }
    };

    loadMasters();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (values) => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const containerCount = parseInt(values.no_of_containers, 10);
      const containers = values.containerDetails || [];
      const totalContainers = containers.reduce((sum, row) => {
        const n = parseInt(row.no_of_containers, 10);
        return sum + (isNaN(n) ? 0 : n);
      }, 0);

      // Aggregate weight string & primary cargo for legacy consumers
      const primaryCargo = values.cargoDetails?.[0];
      const finalWeight = primaryCargo?.weight_value
        ? `${primaryCargo.weight_value} ${primaryCargo.weight_uom || 'KG'}`.trim()
        : '';

      const payload = {
        ...values,
        cargoDetails: values.cargoDetails,
        containerDetails: containers,
        gross_weight: finalWeight,
        quantity: totalContainers || 1,
        weight: finalWeight,
        customer_id: values.exporter_id,
        customer_name: values.exporter_name,
        origin: values.pol,
        destination: values.pod,
        remarks: values.special_requirements,
        factory_name: values.factory_name || factoryDetails?.factory_name || '',
        factory_address: values.factory_address || factoryDetails?.factory_address || '',
        factory_contact_person: values.factory_contact_person || factoryDetails?.contact_person || '',
        factory_details: {
          factory_name: values.factory_name || factoryDetails?.factory_name || '',
          factory_address: values.factory_address || factoryDetails?.factory_address || '',
          contact_person: values.factory_contact_person || factoryDetails?.contact_person || '',
        },
      };

      let response;
      if (isEditMode && initialData?.id) {
        response = await shippingInquiryService.updateInquiry(initialData.id, payload);
      } else {
        response = await shippingInquiryService.createInquiry(payload);
      }

      const savedData = response?.data?.data || response?.data || payload;
      onSuccess?.(savedData);
    } catch (err) {
      const respData = err?.response?.data;
      let errMsg = 'Failed to save Shipping Inquiry';
      if (typeof respData === 'string') {
        if (respData.includes('Cannot POST') || respData.includes('Cannot GET')) {
          errMsg = 'Backend route not found. Please restart your backend server (server.js / nodemon).';
        } else {
          errMsg = respData;
        }
      } else if (respData?.message) {
        errMsg = respData.message;
      } else if (err?.message) {
        errMsg = err.message;
      }
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || isDropdownsLoading;

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg" >
      <div className="flex justify-between align-center mb-md border-b-light pb-sm" style={styles.header}>
        <div>
          <h2 className="text-lg font-semibold m-0" style={styles.title}>
            {isEditMode
              ? `Edit Export Shipment Inquiry (${defaultValues.inquiry_no})`
              : 'New Export Shipment Inquiry'}
          </h2>
          <p className="text-xs text-tertiary m-0 mt-xs" style={styles.subtitle}>
            Capture exporter, routing, cargo, and container requirements for export quotation preparation.
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel} leftIcon={X} size="sm">
          Close
        </Button>
      </div>

      {submitError && (
        <div className="alert alert-danger mb-md p-sm text-sm" style={styles.alert} role="alert">
          <AlertCircle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <form className='flex flex-col' style={{ gap: '20px' }} onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* SECTION 1 — EXPORTER DETAILS */}
        <FloatingWrapper>
          <div style={styles.sectionHeader}>
            <Building2 size={16} color="#1976D2" />
            <span>Section 1 — Exporter Details</span>
          </div>
          <div style={styles.grid}>
            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Inquiry No <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                readOnly
                className="form-control form-control-sm"
                style={styles.inputReadonly}
                {...register('inquiry_no')}
              />
              <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                System generated (Format: ESI/SS/MM-YY/001)
              </small>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Exporter <span style={styles.required}>*</span>
              </label>
              <select
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('exporter_id', {
                  required: 'Exporter is mandatory. Please select an Exporter.',
                })}
              >
                <option value="">Select Exporter (Customer Master)...</option>
                {exporters.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {getExporterName(exp)}
                  </option>
                ))}
              </select>
              {errors.exporter_id && (
                <div style={styles.error}>{errors.exporter_id.message}</div>
              )}
            </div>
          </div>
        </FloatingWrapper>
        {/* SECTION 2 — ROUTING DETAILS */}
        <FloatingWrapper>
          <div style={styles.sectionHeader}>
            <MapPin size={16} color="#1976D2" />
            <span>Section 2 — Routing Details</span>
          </div>
          <div style={styles.grid}>
            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Port of Loading (POL){' '}
                <span style={styles.optional}>(Optional)</span>
              </label>
              <Controller
                name="pol"
                control={control}
                rules={{
                  validate: (value) => {
                    if (value && pod && value.trim().toLowerCase() === String(pod).trim().toLowerCase()) {
                      return 'POL and POD cannot be identical.';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <select
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...field}
                    onChange={(e) => {
                      const next = e.target.value;
                      field.onChange(next);
                      if (pod && next && pod === next) {
                        setValue('pod', '');
                      }
                    }}
                  >
                    <option value="">Select Port of Loading (POL)...</option>
                    {ports.map((p) => {
                      const label = portLabel(p);
                      return (
                        <option
                          key={typeof p === 'object' ? p.id || label : p}
                          value={label}
                          disabled={!!pod && label === pod}
                        >
                          {label}
                          {pod && label === pod ? ' (Selected as POD)' : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              />
              {errors.pol && <div style={styles.error}>{errors.pol.message}</div>}
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Port of Discharge (POD){' '}
                <span style={styles.optional}>(Optional)</span>
              </label>
              <Controller
                name="pod"
                control={control}
                rules={{
                  validate: (value) => {
                    if (value && pol && value.trim().toLowerCase() === String(pol).trim().toLowerCase()) {
                      return 'POL and POD cannot be identical.';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <select
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...field}
                    onChange={(e) => {
                      const next = e.target.value;
                      field.onChange(next);
                      if (pol && next && pol === next) {
                        setValue('pol', '');
                      }
                    }}
                  >
                    <option value="">Select Port of Discharge (POD)...</option>
                    {ports.map((p) => {
                      const label = portLabel(p);
                      return (
                        <option
                          key={typeof p === 'object' ? p.id || label : p}
                          value={label}
                          disabled={!!pol && label === pol}
                        >
                          {label}
                          {pol && label === pol ? ' (Selected as POL)' : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              />
              {errors.pod && <div style={styles.error}>{errors.pod.message}</div>}
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Final Place of Delivery (FPOD){' '}
                <span style={styles.optional}>(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Inland Depot / Destination ICD / Factory"
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('fpod')}
              />
            </div>
          </div>
        </FloatingWrapper>
        {/* SECTION 3 — CARGO DETAILS (field array) */}
        <FloatingWrapper>
          <div style={styles.sectionHeader}>
            <Package size={16} color="#1976D2" />
            <span>Section 3 — Cargo Details</span>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} style={styles.cargoCard}>
              <div style={styles.cargoHeader}>
                <strong>Cargo {index + 1}</strong>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={disabled}
                    style={styles.removeBtn}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>

              <div style={styles.gridSm}>
                <div className="form-group">
                  <label style={styles.label}>
                    Commodity <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cotton Yarn / Ceramic Tiles"
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...register(`cargoDetails.${index}.commodity`, {
                      required: 'Commodity is mandatory.',
                      validate: (v) =>
                        (v && String(v).trim().length > 0) ||
                        'Commodity is mandatory.',
                    })}
                  />
                  {errors.cargoDetails?.[index]?.commodity && (
                    <div style={styles.error}>
                      {errors.cargoDetails[index].commodity.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label style={styles.label}>
                    HSN Code <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5205.12 / 6907.21"
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...register(`cargoDetails.${index}.hsn_code`, {
                      required: 'HSN Code is mandatory for quotation preparation.',
                      validate: (v) =>
                        (v && String(v).trim().length > 0) ||
                        'HSN Code is mandatory for quotation preparation.',
                    })}
                  />
                  {errors.cargoDetails?.[index]?.hsn_code && (
                    <div style={styles.error}>
                      {errors.cargoDetails[index].hsn_code.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label style={styles.label}>
                    Cargo Type <span style={styles.required}>*</span>
                  </label>
                  <select
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...register(`cargoDetails.${index}.cargo_type`, {
                      required: 'Cargo type is required.',
                    })}
                  >
                    <option value="General">General Cargo</option>
                    <option value="Hazardous">Hazardous (HAZ)</option>
                    <option value="Reefer">Reefer (Temperature Controlled)</option>
                    <option value="OOG">OOG (Out of Gauge / Overdimensional)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={styles.label}>
                    Gross Weight (per container){' '}
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="e.g. 24000"
                      className="form-control form-control-sm"
                      style={{ ...styles.input, width: '60%' }}
                      disabled={disabled}
                      {...register(`cargoDetails.${index}.weight_value`, {
                        required: 'Gross Weight per container is mandatory.',
                        validate: (v) =>
                          (v && String(v).trim().length > 0) ||
                          'Gross Weight per container is mandatory.',
                      })}
                    />
                    <select
                      className="form-control form-control-sm"
                      style={{ ...styles.input, width: '40%' }}
                      disabled={disabled}
                      {...register(`cargoDetails.${index}.weight_uom`, {
                        required: true,
                      })}
                    >
                      {uoms.map((u) => {
                        const code =
                          u.uom_code || u.code || u.uom_name || u.name || 'KG';
                        const label = u.uom_name || u.name || code;
                        return (
                          <option key={u.id || code} value={code}>
                            {code} ({label})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {errors.cargoDetails?.[index]?.weight_value && (
                    <div style={styles.error}>
                      {errors.cargoDetails[index].weight_value.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append(emptyCargo())}
            disabled={disabled}
            style={styles.addCargoBtn}
          >
            <Plus size={16} />
            Add Another Cargo
          </button>
        </FloatingWrapper>
        {/* SECTION 4 — CONTAINER REQUIREMENTS */}
        <FloatingWrapper>
          <div style={styles.sectionHeader}>
            <Box size={16} color="#1976D2" />
            <span>Section 4 — Container Requirements</span>
          </div>
          {containerFields.map((field, index) => (
            <div key={field.id} style={styles.cargoCard}>
              <div style={styles.cargoHeader}>
                <strong>Container Line {index + 1}</strong>
                {containerFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContainer(index)}
                    disabled={disabled}
                    style={styles.removeBtn}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>

              <div style={styles.grid}>
                <div className="form-group">
                  <label className="text-sm font-medium" style={styles.label}>
                    Container Requirement <span style={styles.required}>*</span>
                  </label>
                  <select
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...register(`containerDetails.${index}.container_type`, {
                      required: 'Container Requirement is mandatory.',
                    })}
                  >
                    <option value="">Select Container Type...</option>
                    {containerTypes.map((ct) => {
                      const code =
                        typeof ct === 'object'
                          ? ct.container_code || ct.code
                          : ct;
                      const name =
                        typeof ct === 'object'
                          ? ct.container_name || ct.name
                          : ct;
                      const label =
                        code && name && code !== name
                          ? `${code} - ${name}`
                          : code || name;
                      const val = code || name;
                      return (
                        <option
                          key={typeof ct === 'object' ? ct.id || val : ct}
                          value={val}
                        >
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  {errors.containerDetails?.[index]?.container_type && (
                    <div style={styles.error}>
                      {errors.containerDetails[index].container_type.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="text-sm font-medium" style={styles.label}>
                    No. of Containers <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="e.g. 2"
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...register(`containerDetails.${index}.no_of_containers`, {
                      required: 'No. of Containers is required.',
                      validate: (v) => {
                        const n = parseInt(v, 10);
                        if (isNaN(n) || n <= 0) {
                          return 'No. of Containers must be a positive integer greater than 0.';
                        }
                        return true;
                      },
                    })}
                  />
                  {errors.containerDetails?.[index]?.no_of_containers && (
                    <div style={styles.error}>
                      {errors.containerDetails[index].no_of_containers.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendContainer(emptyContainer())}
            disabled={disabled}
            style={styles.addCargoBtn}
          >
            <Plus size={16} />
            Add Another Container Type
          </button>
        </FloatingWrapper>
        {/* SECTION 5 — COMMERCIAL / SHIPMENT TERMS */}
        <FloatingWrapper>
          <div style={styles.sectionHeader}>
            <FileText size={16} color="#1976D2" />
            <span>Section 5 — Commercial / Shipment Terms</span>
          </div>
          <div style={styles.grid}>
            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Shipment Type <span style={styles.required}>*</span>
              </label>
              <select
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('shipment_type', { required: true })}
              >
                <option value="">-- Select Shipment Type --</option>
                {transportModes.map((tm) => (
                  <option
                    key={tm.id || tm.mode_code}
                    value={tm.mode_name || tm.mode_code}
                  >
                    {tm.mode_name} {tm.mode_code ? `(${tm.mode_code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Shipment Sub Type <span style={styles.required}>*</span>
              </label>
              <select
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('shipment_sub_type', { required: true })}
              >
                <option value="Clearing">Clearing</option>
                <option value="Forwarding">Forwarding</option>
                <option value="Transport">Transport</option>
              </select>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Shipment Terms (Incoterms) <span style={styles.required}>*</span>
              </label>
              <select
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('shipment_terms', { required: true })}
              >
                <option value="FOB">FOB — Free On Board</option>
                <option value="CIF">CIF — Cost, Insurance & Freight</option>
                <option value="CFR">CFR — Cost & Freight</option>
                <option value="EXW">EXW — Ex Works</option>
                <option value="FCA">FCA</option>
                <option value="DAP">DAP</option>
                <option value="DDP">DDP</option>
                <option value="Freight_Prepaid">Freight Prepaid</option>
                <option value="Freight_Collect">Freight Collect</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </FloatingWrapper>
        {/* SECTION 6 — STUFFING & CARGO READINESS */}
        <FloatingWrapper>
          <div style={styles.sectionHeader}>
            <Calendar size={16} color="#1976D2" />
            <span>Section 6 — Stuffing & Cargo Readiness</span>
          </div>
          <div style={styles.grid}>
            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Expected Cargo Ready Date <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('cargo_ready_date', {
                  required: 'Expected Cargo Ready Date is mandatory.',
                })}
              />
              {errors.cargo_ready_date && (
                <div style={styles.error}>{errors.cargo_ready_date.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Stuffing Type <span style={styles.required}>*</span>
              </label>
              <Controller
                name="stuffing_location"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <select
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  >
                    <option value="Factory">Factory Stuffing</option>
                    <option value="CFS">CFS Stuffing (Container Freight Station)</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              />
            </div>

            {stuffingLocation === 'Other' && (
              <div className="form-group">
                <label className="text-sm font-medium" style={styles.label}>
                  Specify Stuffing Type <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Private Warehouse, Morbi / Sanand"
                  className="form-control form-control-sm"
                  style={styles.input}
                  disabled={disabled}
                  {...register('stuffing_location_other', {
                    validate: (v) => {
                      if (stuffingLocation === 'Other' && !String(v || '').trim()) {
                        return 'Please specify the stuffing type when "Other" is selected.';
                      }
                      return true;
                    },
                  })}
                />
                {errors.stuffing_location_other && (
                  <div style={styles.error}>
                    {errors.stuffing_location_other.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Simple Input & Textarea Fields for Factory Stuffing */}
          {stuffingLocation === 'Factory' && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="text-sm font-medium" style={styles.label}>
                    Factory / Plant Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Global Textiles - Factory Unit 1"
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...register('factory_name', {
                      required: stuffingLocation === 'Factory' ? 'Factory Name is required for Factory Stuffing.' : false,
                    })}
                  />
                  {errors.factory_name && (
                    <div style={styles.error}>{errors.factory_name.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="text-sm font-medium" style={styles.label}>
                    Contact Person & Phone <span style={styles.optional}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Rajesh Mehta (+91 98765 43210)"
                    className="form-control form-control-sm"
                    style={styles.input}
                    disabled={disabled}
                    {...register('factory_contact_person')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-sm font-medium" style={styles.label}>
                  Factory Stuffing Address <span style={styles.required}>*</span>
                </label>
                <textarea
                  placeholder="Enter complete factory stuffing address, GIDC plot no, city, state & pincode..."
                  rows={3}
                  className="form-control form-control-sm"
                  style={{ ...styles.input, height: 'auto', padding: '0.5rem' }}
                  disabled={disabled}
                  {...register('factory_address', {
                    required: stuffingLocation === 'Factory' ? 'Factory Stuffing Address is required.' : false,
                  })}
                />
                {errors.factory_address && (
                  <div style={styles.error}>{errors.factory_address.message}</div>
                )}
              </div>
            </div>
          )}
        </FloatingWrapper>
        {/* SECTION 7 — CARRIER & FREE DAYS */}
        <FloatingWrapper>
          <div style={styles.sectionHeader}>
            <Ship size={16} color="#1976D2" />
            <span>Section 7 — Carrier & Commercial Requirements</span>
          </div>
          <div style={styles.grid}>
            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Shipping Line Preference{' '}
                <span style={styles.optional}>(Optional)</span>
              </label>
              <select
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('shipping_line_preference')}
              >
                <option value="">No Line Preference (Any Line)</option>
                {shippingLines.map((sl) => {
                  const name =
                    typeof sl === 'object'
                      ? sl.name || sl.shipping_line_name || sl.line_name
                      : sl;
                  return (
                    <option
                      key={typeof sl === 'object' ? sl.id || name : sl}
                      value={name}
                    >
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Free Days Required{' '}
                <span style={styles.optional}>(Optional)</span>
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 14"
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('free_days_required', {
                  validate: (v) => {
                    if (v === '' || v === null || v === undefined) return true;
                    const days = parseInt(v, 10);
                    if (isNaN(days) || days < 0) {
                      return 'Free Days Required cannot be negative.';
                    }
                    return true;
                  },
                })}
              />
              {errors.free_days_required && (
                <div style={styles.error}>{errors.free_days_required.message}</div>
              )}
            </div>
          </div>
        </FloatingWrapper>
        {/* SECTION 8 — STATUS & NOTES */}
        <FloatingWrapper>
          <div style={styles.sectionHeader}>
            <FileText size={16} color="#1976D2" />
            <span>Section 8 — Special Requirements & Operational Status</span>
          </div>
          <div style={styles.grid}>
            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Inspections
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                placeholder="Enter inspection requirements"
                {...register('inspections')}
              />
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Certifications
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                placeholder="Enter certification requirements"
                {...register('certifications')}
              />
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Fumigations
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                placeholder="Enter fumigation requirements"
                {...register('fumigations')}
              />
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Loading/Unloading
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                placeholder="Enter loading/unloading requirements"
                {...register('loading_unloading')}
              />
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Palletization
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                placeholder="Enter palletization requirements"
                {...register('palletization')}
              />
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Lashing/Chocking
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                placeholder="Enter lashing/chocking requirements"
                {...register('lashing_chocking')}
              />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Priority
              </label>
              <select
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('priority')}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Inquiry Status
              </label>
              <select
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('status')}
              >
                <option value="Pending">Pending</option>
                <option value="Quoted">Quoted</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="text-sm font-medium" style={styles.label}>
              Special Requirements / Exporter Instructions{' '}
              <span style={styles.optional}>(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Specify any carrier preferences, temperature settings, hazardous class, documentation instructions..."
              className="form-control form-control-sm"
              style={{ ...styles.input, resize: 'vertical', padding: '0.5rem 0.65rem' }}
              disabled={disabled}
              {...register('special_requirements')}
            />
          </div>

          <div className="form-actions" style={styles.actions}>
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={disabled}
              isLoading={isSubmitting}
              leftIcon={Check}
            >
              {isEditMode ? 'Update Inquiry' : 'Save Inquiry'}
            </Button>
          </div>
        </FloatingWrapper>
      </form>

      <FactorySelectionModal
        isOpen={isFactoryModalOpen}
        onClose={() => setIsFactoryModalOpen(false)}
        onSave={(data) => {
          setFactoryDetails(data);
          setValue('factory_name', data.factory_name);
          setValue('factory_address', data.factory_address);
          setValue('factory_city', data.city);
          setValue('factory_state', data.state);
          setValue('factory_pincode', data.pincode);
          setValue('factory_contact_person', data.contact_person);
          setValue('factory_contact_phone', data.contact_phone);
          setValue('factory_gstin', data.gstin);
        }}
        initialFactory={factoryDetails || {}}
        exporterName={watch('exporter_name')}
      />
    </div>
  );
};

export default ShippingInquiryForm;
