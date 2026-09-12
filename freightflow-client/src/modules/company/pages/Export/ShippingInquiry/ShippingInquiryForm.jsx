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

const formatReadyDate = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    return dateVal.trim();
  }
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) { }
  return String(dateVal).split('T')[0] || '';
};

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

const DEFAULT_TRANSPORT_MODES = [
  { id: 'tm_1', mode_code: 'AIR', mode_name: 'Air Freight' },
  { id: 'tm_2', mode_code: 'SEA', mode_name: 'Ocean Freight (FCL/LCL)' },
  { id: 'tm_3', mode_code: 'ROAD', mode_name: 'Road / Land Transport' },
  { id: 'tm_4', mode_code: 'RAIL', mode_name: 'Rail Freight' },
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

  // Normalize cargo details
  let rawCargos = initialData.cargoDetails || initialData.cargos || initialData.cargo_details;
  if (typeof rawCargos === 'string') {
    try { rawCargos = JSON.parse(rawCargos); } catch (e) { rawCargos = null; }
  }

  let cargoDetails = [];
  if (Array.isArray(rawCargos) && rawCargos.length > 0) {
    cargoDetails = rawCargos.map((c) => {
      const cWeight = parseWeightString(c.weight_value || c.gross_weight || c.weight || rawWeight);
      return {
        id: c.id,
        commodity: c.commodity || c.commodity_name || c.item_name || '',
        hsn_code: c.hsn_code || c.hsn || c.hs_code || '',
        cargo_type: c.cargo_type || c.type || 'General',
        weight_value: c.weight_value !== undefined && c.weight_value !== null && c.weight_value !== ''
          ? String(c.weight_value)
          : (cWeight.val || parsedWeight.val || ''),
        weight_uom: c.weight_uom || c.uom || cWeight.uom || parsedWeight.uom || 'KG',
      };
    });
  } else {
    cargoDetails = [
      {
        commodity: initialData.commodity || initialData.commodity_name || '',
        hsn_code: initialData.hsn_code || initialData.hsn || '',
        cargo_type: initialData.cargo_type || 'General',
        weight_value: parsedWeight.val || '',
        weight_uom: parsedWeight.uom || 'KG',
      },
    ];
  }

  // Normalize container details
  let rawContainers = initialData.containerDetails || initialData.containers || initialData.container_details;
  if (typeof rawContainers === 'string') {
    try { rawContainers = JSON.parse(rawContainers); } catch (e) { rawContainers = null; }
  }

  let containerDetails = [];
  if (Array.isArray(rawContainers) && rawContainers.length > 0) {
    containerDetails = rawContainers.map((c) => ({
      id: c.id,
      container_type: c.container_type || c.containerType || c.type || "20'",
      no_of_containers: String(c.no_of_containers ?? c.quantity ?? c.count ?? c.no_of_container ?? '1'),
    }));
  } else {
    containerDetails = [
      {
        container_type: initialData.container_type || initialData.containerType || "20'",
        no_of_containers: String(
          initialData.no_of_containers ?? initialData.quantity ?? '1'
        ),
      },
    ];
  }

  // Parse factory details
  let parsedFactory = initialData.factory_details;
  if (typeof parsedFactory === 'string') {
    try { parsedFactory = JSON.parse(parsedFactory); } catch (e) { parsedFactory = null; }
  }

  // Normalize stuffing location
  let stuffingLocation = initialData.stuffing_location || initialData.stuffing_type || 'Factory';
  let stuffingLocationOther = initialData.stuffing_location_other || initialData.other_stuffing_location || '';
  const locLower = String(stuffingLocation).toLowerCase().trim();
  if (locLower === 'factory' || locLower === 'factory stuffing') {
    stuffingLocation = 'Factory';
  } else if (locLower === 'cfs' || locLower === 'cfs stuffing') {
    stuffingLocation = 'CFS';
  } else if (stuffingLocation !== 'Factory' && stuffingLocation !== 'CFS') {
    stuffingLocationOther = stuffingLocationOther || stuffingLocation;
    stuffingLocation = 'Other';
  }

  // Normalize priority
  let priority = initialData.priority || 'Medium';
  if (typeof priority === 'string' && priority.length > 0) {
    priority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  }
  if (!['Low', 'Medium', 'High'].includes(priority)) {
    priority = 'Medium';
  }

  // Normalize shipment terms (handle underscores and casing)
  let shipmentTerms = initialData.shipment_terms || initialData.incoterms || initialData.terms || 'FOB';
  if (shipmentTerms === 'Freight_Prepaid') shipmentTerms = 'Freight Prepaid';
  if (shipmentTerms === 'Freight_Collect') shipmentTerms = 'Freight Collect';

  // Normalize shipment type
  let shipmentType = initialData.shipment_type || initialData.transport_mode || initialData.mode_of_shipment || '';
  if (shipmentType) {
    const sLower = String(shipmentType).toLowerCase().trim();
    if (sLower === 'sea' || sLower === 'ocean' || sLower === 'ocean freight' || sLower === 'sea freight' || sLower === 'ocean freight (fcl/lcl)') {
      shipmentType = 'Ocean Freight (FCL/LCL)';
    } else if (sLower === 'air' || sLower === 'air freight') {
      shipmentType = 'Air Freight';
    } else if (sLower === 'road' || sLower === 'land' || sLower === 'road freight' || sLower === 'road / land transport') {
      shipmentType = 'Road / Land Transport';
    } else if (sLower === 'rail' || sLower === 'rail freight') {
      shipmentType = 'Rail Freight';
    }
  }

  return {
    inquiry_no: initialData.inquiry_no || generateInquiryNo(existingCount),
    exporter_id: initialData.exporter_id || initialData.customer_id || '',
    exporter_name: initialData.exporter_name || initialData.customer_name || '',
    pol: initialData.pol || initialData.origin || initialData.port_of_loading || '',
    pod: initialData.pod || initialData.destination || initialData.port_of_discharge || '',
    fpod: initialData.fpod || initialData.final_destination || initialData.place_of_delivery || '',
    shipment_type: shipmentType,
    shipment_sub_type: initialData.shipment_sub_type || initialData.sub_type || '',
    shipment_terms: shipmentTerms,
    cargo_ready_date: formatReadyDate(initialData.cargo_ready_date || initialData.ready_date || initialData.expected_ready_date),
    stuffing_location: stuffingLocation,
    stuffing_location_other: stuffingLocationOther,
    factory_name: initialData.factory_name || parsedFactory?.factory_name || initialData.plant_name || '',
    factory_address: initialData.factory_address || parsedFactory?.factory_address || '',
    factory_contact_person: initialData.factory_contact_person || parsedFactory?.contact_person || parsedFactory?.factory_contact_person || initialData.contact_person || '',
    shipping_line_preference: initialData.shipping_line_preference || initialData.shipping_line || initialData.carrier_preference || initialData.line_preference || '',
    free_days_required:
      initialData.free_days_required !== undefined && initialData.free_days_required !== null && initialData.free_days_required !== ''
        ? String(initialData.free_days_required)
        : (initialData.free_days !== undefined && initialData.free_days !== null && initialData.free_days !== '' ? String(initialData.free_days) : ''),
    special_requirements:
      initialData.special_requirements || initialData.remarks || initialData.special_instructions || initialData.notes || initialData.exporter_instructions || '',
    inspections: initialData.inspections || initialData.inspection || '',
    certifications: initialData.certifications || initialData.certification || '',
    fumigations: initialData.fumigations || initialData.fumigation || '',
    loading_unloading: initialData.loading_unloading || '',
    palletization: initialData.palletization || '',
    lashing_chocking: initialData.lashing_chocking || '',
    priority: priority,
    status: initialData.status || 'Pending',
    cargoDetails,
    containerDetails
  };
};

// ============================================================
// Styles
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
    let fact = initialData?.factory_details;
    if (typeof fact === 'string') {
      try { fact = JSON.parse(fact); } catch (e) { fact = null; }
    }
    return fact || (initialData?.factory_name ? {
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

  const [exporters, setExporters] = useState(() => {
    const list = [...DEFAULT_EXPORTERS];
    if (initialData?.exporter_id || initialData?.exporter_name || initialData?.customer_name) {
      const expId = initialData.exporter_id || initialData.customer_id || initialData.exporter_name;
      const expName = initialData.exporter_name || initialData.customer_name || expId;
      if (!list.some(e => String(e.id) === String(expId) || getExporterName(e).toLowerCase() === expName.toLowerCase())) {
        list.unshift({ id: expId, customer_name: expName });
      }
    }
    return list;
  });

  const [ports, setPorts] = useState(() => {
    const list = [...DEFAULT_PORTS];
    const pol = initialData?.pol || initialData?.origin;
    const pod = initialData?.pod || initialData?.destination;
    if (pol && !list.some(p => portLabel(p).toLowerCase() === String(pol).toLowerCase())) {
      list.unshift({ id: `pol_${pol}`, port_name: pol, port_code: pol });
    }
    if (pod && !list.some(p => portLabel(p).toLowerCase() === String(pod).toLowerCase())) {
      list.unshift({ id: `pod_${pod}`, port_name: pod, port_code: pod });
    }
    return list;
  });

  const [shippingLines, setShippingLines] = useState(() => {
    const list = [...DEFAULT_SHIPPING_LINES];
    const line = initialData?.shipping_line_preference || initialData?.shipping_line;
    if (line && !list.some(sl => (sl.name || sl).toLowerCase() === String(line).toLowerCase())) {
      list.unshift({ id: `sl_${line}`, name: line });
    }
    return list;
  });

  const [containerTypes, setContainerTypes] = useState(() => {
    const list = [...DEFAULT_CONTAINER_TYPES];
    const initialContainers = initialData?.containerDetails || (initialData?.container_type ? [{ container_type: initialData.container_type }] : []);
    if (Array.isArray(initialContainers)) {
      initialContainers.forEach((c) => {
        const ct = c.container_type || c.containerType;
        if (ct && !list.some(item => (item.container_code || item.container_name || item).toLowerCase() === String(ct).toLowerCase())) {
          list.push({ id: `ct_${ct}`, container_code: ct, container_name: ct });
        }
      });
    }
    return list;
  });

  const [uoms, setUoms] = useState(DEFAULT_UOMS);
  const [transportModes, setTransportModes] = useState(DEFAULT_TRANSPORT_MODES);

  const defaultValues = useMemo(
    () => buildDefaultValues(initialData, existingCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialData, existingCount]
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
      return;
    }
    const selected = exporters.find((c) => String(c.id) === String(exporterId) || getExporterName(c).toLowerCase() === String(exporterId).toLowerCase());
    if (selected) {
      setValue('exporter_name', getExporterName(selected), { shouldDirty: true });
    }
  }, [exporterId, exporters, setValue]);

  // Reset form and factory state when switching create/edit record
  useEffect(() => {
    const values = buildDefaultValues(initialData, existingCount);
    reset(values);

    let fact = initialData?.factory_details;
    if (typeof fact === 'string') {
      try { fact = JSON.parse(fact); } catch (e) { fact = null; }
    }
    if (values.factory_name || values.factory_address || fact) {
      setFactoryDetails({
        factory_name: values.factory_name,
        factory_address: values.factory_address,
        city: initialData?.factory_city || initialData?.city || fact?.city || '',
        state: initialData?.factory_state || initialData?.state || fact?.state || 'Gujarat',
        pincode: initialData?.factory_pincode || initialData?.pincode || fact?.pincode || '',
        contact_person: values.factory_contact_person || initialData?.contact_person || fact?.contact_person || '',
        contact_phone: initialData?.factory_contact_phone || initialData?.contact_phone || fact?.contact_phone || '',
        gstin: initialData?.factory_gstin || initialData?.gstin || fact?.gstin || ''
      });
    } else {
      setFactoryDetails(null);
    }
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

        // 1. Exporters
        const custData = extractList(custRes);
        let mergedExporters = custData.length > 0 ? custData : DEFAULT_EXPORTERS;
        if (initialData?.exporter_id || initialData?.exporter_name || initialData?.customer_name) {
          const expId = initialData.exporter_id || initialData.customer_id;
          const expName = initialData.exporter_name || initialData.customer_name;
          const exists = mergedExporters.some(
            (c) => (expId && String(c.id) === String(expId)) || (expName && getExporterName(c).toLowerCase() === String(expName).toLowerCase())
          );
          if (!exists && (expId || expName)) {
            mergedExporters = [{ id: expId || expName, customer_name: expName || expId }, ...mergedExporters];
          }
        }
        setExporters(mergedExporters);

        // Auto-match exporter_id if only exporter_name was in initialData
        if (initialData && !initialData.exporter_id && (initialData.exporter_name || initialData.customer_name)) {
          const targetName = (initialData.exporter_name || initialData.customer_name).toLowerCase();
          const matchExp = mergedExporters.find(c => getExporterName(c).toLowerCase() === targetName);
          if (matchExp?.id) {
            setValue('exporter_id', matchExp.id);
          }
        }

        // 2. Ports
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

        // Ensure initial POL / POD are included in ports options
        const initialPol = initialData?.pol || initialData?.origin;
        const initialPod = initialData?.pod || initialData?.destination;
        if (initialPol && !mergedPorts.some(p => portLabel(p).toLowerCase() === String(initialPol).toLowerCase())) {
          mergedPorts = [{ id: `pol_${initialPol}`, port_name: initialPol, port_code: initialPol }, ...mergedPorts];
        }
        if (initialPod && !mergedPorts.some(p => portLabel(p).toLowerCase() === String(initialPod).toLowerCase())) {
          mergedPorts = [{ id: `pod_${initialPod}`, port_name: initialPod, port_code: initialPod }, ...mergedPorts];
        }
        setPorts(mergedPorts);

        // 3. Shipping Lines
        const lineData = extractList(shipLineRes);
        let mergedLines = lineData.length > 0 ? lineData : DEFAULT_SHIPPING_LINES;
        const initialLine = initialData?.shipping_line_preference || initialData?.shipping_line;
        if (initialLine && !mergedLines.some(sl => (sl.name || sl.shipping_line_name || sl.line_name || sl).toLowerCase() === String(initialLine).toLowerCase())) {
          mergedLines = [{ id: `sl_${initialLine}`, name: initialLine }, ...mergedLines];
        }
        setShippingLines(mergedLines);

        // 4. Container Types
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

        // Ensure container types from initialData are included
        const initialContainers = initialData?.containerDetails || (initialData?.container_type ? [{ container_type: initialData.container_type }] : []);
        if (Array.isArray(initialContainers)) {
          initialContainers.forEach(c => {
            const ct = c.container_type || c.containerType;
            if (ct && !mergedContainerTypes.some(item => String(item.container_code || item.code || item.container_name || item).toLowerCase() === String(ct).toLowerCase())) {
              mergedContainerTypes.push({ id: `ct_${ct}`, container_code: ct, container_name: ct });
            }
          });
        }
        setContainerTypes(mergedContainerTypes);

        // 5. UOMs
        const uomData = extractList(uomRes);
        let mergedUoms = uomData.length > 0 ? uomData : DEFAULT_UOMS;
        const initialCargos = initialData?.cargoDetails || (initialData?.gross_weight ? [{ weight_uom: parseWeightString(initialData.gross_weight).uom }] : []);
        if (Array.isArray(initialCargos)) {
          initialCargos.forEach(c => {
            const uomCode = c.weight_uom || c.uom;
            if (uomCode && !mergedUoms.some(u => String(u.uom_code || u.code || u.uom_name || u).toLowerCase() === String(uomCode).toLowerCase())) {
              mergedUoms.push({ id: `uom_${uomCode}`, uom_code: uomCode, uom_name: uomCode });
            }
          });
        }
        setUoms(mergedUoms);

        // 6. Transport Modes
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
          tmData = DEFAULT_TRANSPORT_MODES;
        }

        const initialShipType = initialData?.shipment_type || initialData?.transport_mode;
        if (initialShipType && !tmData.some(tm => String(tm.mode_name || tm.mode_code || tm).toLowerCase() === String(initialShipType).toLowerCase())) {
          tmData = [{ id: `tm_${initialShipType}`, mode_code: initialShipType, mode_name: initialShipType }, ...tmData];
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
  }, [initialData, setValue]);

  const onSubmit = async (values) => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
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

      const isFactory = values.stuffing_location === 'Factory';

      const payload = {
        ...values,
        inquiry_no: values.inquiry_no,
        exporter_id: values.exporter_id,
        exporter_name: values.exporter_name,
        pol: values.pol,
        pod: values.pod,
        fpod: values.fpod,
        shipment_type: values.shipment_type,
        shipment_sub_type: values.shipment_sub_type,
        shipment_terms: values.shipment_terms,
        cargo_ready_date: values.cargo_ready_date || null,
        stuffing_location: values.stuffing_location,
        stuffing_location_other: values.stuffing_location === 'Other' ? values.stuffing_location_other : '',
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
        special_requirements: values.special_requirements,
        free_days_required: values.free_days_required ? parseInt(values.free_days_required, 10) : null,
        factory_name: isFactory ? (values.factory_name || factoryDetails?.factory_name || '') : '',
        factory_address: isFactory ? (values.factory_address || factoryDetails?.factory_address || '') : '',
        factory_contact_person: isFactory ? (values.factory_contact_person || factoryDetails?.contact_person || '') : '',
        factory_details: isFactory ? {
          factory_name: values.factory_name || factoryDetails?.factory_name || '',
          factory_address: values.factory_address || factoryDetails?.factory_address || '',
          contact_person: values.factory_contact_person || factoryDetails?.contact_person || '',
          city: factoryDetails?.city || '',
          state: factoryDetails?.state || 'Gujarat',
          pincode: factoryDetails?.pincode || '',
          contact_phone: factoryDetails?.contact_phone || '',
          gstin: factoryDetails?.gstin || ''
        } : null,
        // Legacy flat fallbacks
        commodity: primaryCargo?.commodity || '',
        hsn_code: primaryCargo?.hsn_code || '',
        cargo_type: primaryCargo?.cargo_type || 'General',
        container_type: containers[0]?.container_type || "20'",
        no_of_containers: containers[0]?.no_of_containers ? parseInt(containers[0].no_of_containers, 10) : 1,
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

  const disabled = isSubmitting;

  return (
    <div className="bg-surface border-light rounded-lg shadow-sm p-lg" >
      <div className="flex justify-between align-center mb-md border-b-light pb-sm" style={styles.header}>
        <div>
          <h2 className="text-lg font-semibold m-0" style={styles.title}>
            {isEditMode
              ? `Edit Export Shipment Inquiry (${watch('inquiry_no') || defaultValues.inquiry_no})`
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
                    value={field.value || ''}
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
                    value={field.value || ''}
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
                          typeof u === 'object'
                            ? u.uom_code || u.code || u.uom_name || u.name || 'KG'
                            : u;
                        const label =
                          typeof u === 'object' ? u.uom_name || u.name || code : code;
                        return (
                          <option key={typeof u === 'object' ? u.id || code : u} value={code}>
                            {code} {label && label !== code ? `(${label})` : ''}
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
                          ? ct.container_code || ct.code || ct.container_name || ct.name
                          : ct;
                      const name =
                        typeof ct === 'object'
                          ? ct.container_name || ct.name || ct.container_code || ct.code
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
              <Controller
                name="shipment_type"
                control={control}
                rules={{ required: 'Shipment Type is required.' }}
                render={({ field }) => {
                  const rawVal = field.value || '';
                  const matchedMode = transportModes.find((tm) => {
                    const name = String(tm.mode_name || tm.name || '').toLowerCase().trim();
                    const code = String(tm.mode_code || tm.id || '').toLowerCase().trim();
                    const target = String(rawVal).toLowerCase().trim();
                    if (!target) return false;
                    if (name === target || code === target) return true;
                    if ((target === 'sea' || target === 'ocean' || target === 'ocean freight') && (name.includes('ocean') || name.includes('sea'))) return true;
                    if ((target === 'air' || target === 'air freight') && name.includes('air')) return true;
                    if ((target === 'road' || target === 'land') && (name.includes('road') || name.includes('land'))) return true;
                    if ((target === 'rail' || target === 'rail freight') && name.includes('rail')) return true;
                    return false;
                  });

                  const selectedValue = matchedMode ? (matchedMode.mode_name || matchedMode.mode_code || rawVal) : rawVal;

                  return (
                    <select
                      className="form-control form-control-sm"
                      style={styles.input}
                      disabled={disabled}
                      value={selectedValue}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="">-- Select Shipment Type --</option>
                      {transportModes.map((tm) => {
                        const name = tm.mode_name || tm.name || tm.mode_code;
                        const code = tm.mode_code || '';
                        const label = code && name && code !== name ? `${name} (${code})` : name;
                        return (
                          <option key={tm.id || code || name} value={name}>
                            {label}
                          </option>
                        );
                      })}
                      {rawVal && !matchedMode && (
                        <option value={rawVal}>{rawVal}</option>
                      )}
                    </select>
                  );
                }}
              />
              {errors.shipment_type && (
                <div style={styles.error}>{errors.shipment_type.message || 'Shipment Type is required.'}</div>
              )}
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Shipment Sub Type <span style={styles.required}>*</span>
              </label>
              <select
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('shipment_sub_type', { required: 'Shipment Sub Type is required.' })}
              >
                <option value="">-- Select Shipment Sub Type --</option>
                <option value="Clearing">Clearing</option>
                <option value="Forwarding">Forwarding</option>
                <option value="Transport">Transport</option>
                <option value="Clearing & Forwarding">Clearing & Forwarding</option>
                <option value="Door to Door">Door to Door</option>
                <option value="Customs Clearance">Customs Clearance</option>
                <option value="Other">Other</option>
              </select>
              {errors.shipment_sub_type && (
                <div style={styles.error}>{errors.shipment_sub_type.message || 'Shipment Sub Type is required.'}</div>
              )}
            </div>

            <div className="form-group">
              <label className="text-sm font-medium" style={styles.label}>
                Shipment Terms (Incoterms) <span style={styles.required}>*</span>
              </label>
              <select
                className="form-control form-control-sm"
                style={styles.input}
                disabled={disabled}
                {...register('shipment_terms', { required: 'Shipment Terms are required.' })}
              >
                <option value="FOB">FOB — Free On Board</option>
                <option value="CIF">CIF — Cost, Insurance & Freight</option>
                <option value="CFR">CFR — Cost & Freight</option>
                <option value="EXW">EXW — Ex Works</option>
                <option value="FCA">FCA — Free Carrier</option>
                <option value="DAP">DAP — Delivered At Place</option>
                <option value="DDP">DDP — Delivered Duty Paid</option>
                <option value="CIP">CIP — Carriage and Insurance Paid</option>
                <option value="CPT">CPT — Carriage Paid To</option>
                <option value="DAT">DAT — Delivered At Terminal</option>
                <option value="DPU">DPU — Delivered at Place Unloaded</option>
                <option value="Freight Prepaid">Freight Prepaid</option>
                <option value="Freight Collect">Freight Collect</option>
                <option value="Other">Other</option>
              </select>
              {errors.shipment_terms && (
                <div style={styles.error}>{errors.shipment_terms.message || 'Shipment Terms are required.'}</div>
              )}
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
                    value={field.value || 'Factory'}
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

