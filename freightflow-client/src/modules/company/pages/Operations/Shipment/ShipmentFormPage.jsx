import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Page from '../../../../../shared/components/Page';
import PageHeader from '../../../../../shared/components/PageHeader';
import Button from '../../../../../shared/components/Button';
import Loader from '../../../../../shared/components/Loader';
import { ArrowLeft, Save, FileText, X } from 'lucide-react';
import { operationsService } from '../../../../operations/services/operations.service';
import { foundationService } from '../../../../masters/services/foundation.service';
import { businessService } from '../../../../masters/services/business.service';
import { commonService } from '../../../../masters/services/common.service';
import { logisticsService } from '../../../../masters/services/logistics.service';
import { organizationService } from '../../../../masters/services/organization.service';
import { toast } from 'react-toastify';

// Standard fallback master data to guarantee dropdowns rendering even if API tables are empty
const DEFAULT_MASTERS = {
  customers: [
    { id: 'c101', customer_name: 'Global Logistics Corp', customer_code: 'CUST-001' },
    { id: 'c102', customer_name: 'Apex Freight Forwarding', customer_code: 'CUST-002' },
    { id: 'c103', customer_name: 'TransWorld Trade Ltd', customer_code: 'CUST-003' },
    { id: 'c104', customer_name: 'Pacific Cargo Inc', customer_code: 'CUST-004' }
  ],
  vendors: [
    { id: 'v101', vendor_name: 'Maersk Line Agency', vendor_code: 'VEND-001' },
    { id: 'v102', vendor_name: 'MSC Mediterranean Shipping', vendor_code: 'VEND-002' },
    { id: 'v103', vendor_name: 'CMA CGM Logistics', vendor_code: 'VEND-003' },
    { id: 'v104', vendor_name: 'Hapag-Lloyd Transport', vendor_code: 'VEND-004' }
  ],
  employees: [
    { id: 'e101', first_name: 'John', last_name: 'Doe', employee_code: 'EMP-001' },
    { id: 'e102', first_name: 'Sarah', last_name: 'Smith', employee_code: 'EMP-002' },
    { id: 'e103', first_name: 'Michael', last_name: 'Brown', employee_code: 'EMP-003' },
    { id: 'e104', first_name: 'Emily', last_name: 'Davis', employee_code: 'EMP-004' }
  ],
  countries: [
    { id: 'cn1', country_name: 'United States', country_code: 'US' },
    { id: 'cn2', country_name: 'China', country_code: 'CN' },
    { id: 'cn3', country_name: 'Germany', country_code: 'DE' },
    { id: 'cn4', country_name: 'India', country_code: 'IN' },
    { id: 'cn5', country_name: 'United Kingdom', country_code: 'GB' },
    { id: 'cn6', country_name: 'Singapore', country_code: 'SG' },
    { id: 'cn7', country_name: 'United Arab Emirates', country_code: 'AE' }
  ],
  ports: [
    { id: 'p101', port_name: 'Port of Shanghai', port_code: 'CNSHA' },
    { id: 'p102', port_name: 'Port of Singapore', port_code: 'SGSIN' },
    { id: 'p103', port_name: 'Port of Los Angeles', port_code: 'USLAX' },
    { id: 'p104', port_name: 'Port of Rotterdam', port_code: 'NLRTM' },
    { id: 'p105', port_name: 'Port of Hamburg', port_code: 'DEHAM' },
    { id: 'p106', port_name: 'Jebel Ali Port', port_code: 'AEJEA' },
    { id: 'p107', port_name: 'Nhava Sheva - JNPT', port_code: 'INNSA' }
  ],
  commodities: [
    { id: 'cm1', commodity_name: 'Electronics & Semiconductors' },
    { id: 'cm2', commodity_name: 'Textiles & Garments' },
    { id: 'cm3', commodity_name: 'Automotive Spare Parts' },
    { id: 'cm4', commodity_name: 'Pharmaceuticals & Medical' },
    { id: 'cm5', commodity_name: 'Perishable Food Products' },
    { id: 'cm6', commodity_name: 'Machinery & Heavy Equipment' }
  ],
  packageTypes: [
    { id: 'pt1', package_type_name: 'Pallet / Skid', type_name: 'Pallet / Skid' },
    { id: 'pt2', package_type_name: 'Carton / Box', type_name: 'Carton / Box' },
    { id: 'pt3', package_type_name: 'Wooden Crate', type_name: 'Wooden Crate' },
    { id: 'pt4', package_type_name: 'Drum / Barrel', type_name: 'Drum / Barrel' },
    { id: 'pt5', package_type_name: 'Container Bag / FIBC', type_name: 'Container Bag / FIBC' }
  ],
  uoms: [
    { id: 'u1', uom_name: 'Kilograms', uom_code: 'KG' },
    { id: 'u2', uom_name: 'Metric Tons', uom_code: 'MT' },
    { id: 'u3', uom_name: 'Cubic Meters', uom_code: 'CBM' },
    { id: 'u4', uom_name: 'Pieces', uom_code: 'PCS' },
    { id: 'u5', uom_name: 'Packages', uom_code: 'PKG' }
  ],
  transportModes: [
    { id: 'tm1', mode_name: 'Ocean Freight (FCL/LCL)' },
    { id: 'tm2', mode_name: 'Air Freight' },
    { id: 'tm3', mode_name: 'Road / Trucking' },
    { id: 'tm4', mode_name: 'Rail Freight' }
  ],
  shippingLines: [
    { id: 'sl1', shipping_line_name: 'Maersk Line', line_name: 'Maersk Line' },
    { id: 'sl2', shipping_line_name: 'MSC Shipping', line_name: 'MSC Shipping' },
    { id: 'sl3', shipping_line_name: 'CMA CGM Group', line_name: 'CMA CGM Group' },
    { id: 'sl4', shipping_line_name: 'COSCO Shipping', line_name: 'COSCO Shipping' },
    { id: 'sl5', shipping_line_name: 'ONE (Ocean Network Express)', line_name: 'ONE (Ocean Network Express)' },
    { id: 'sl6', shipping_line_name: 'Evergreen Line', line_name: 'Evergreen Line' }
  ],
  vehicles: [
    { id: 'v1', vehicle_number: '20ft Container Truck (TRK-201)' },
    { id: 'v2', vehicle_number: '40ft High Cube Truck (TRK-401)' },
    { id: 'v3', vehicle_number: 'Heavy Haul Trailer (TRK-801)' }
  ],
  warehouses: [
    { id: 'w1', warehouse_name: 'Central Logistics Hub - Port Area' },
    { id: 'w2', warehouse_name: 'Bonded Freight Terminal' },
    { id: 'w3', warehouse_name: 'Airport Air Cargo Depot' }
  ],
  currencies: [
    { id: 'cur1', currency_name: 'US Dollar', currency_code: 'USD' },
    { id: 'cur2', currency_name: 'Euro', currency_code: 'EUR' },
    { id: 'cur3', currency_name: 'British Pound', currency_code: 'GBP' },
    { id: 'cur4', currency_name: 'Indian Rupee', currency_code: 'INR' },
    { id: 'cur5', currency_name: 'UAE Dirham', currency_code: 'AED' }
  ],
  paymentTerms: [
    { id: 'py1', payment_term_name: 'Net 30 Days', term_name: 'Net 30 Days' },
    { id: 'py2', payment_term_name: 'Net 15 Days', term_name: 'Net 15 Days' },
    { id: 'py3', payment_term_name: 'Prepaid / Cash on Order', term_name: 'Prepaid / Cash on Order' },
    { id: 'py4', payment_term_name: 'Collect / Due on Receipt', term_name: 'Collect / Due on Receipt' }
  ],
  incoterms: [
    { id: 'inc1', incoterm_code: 'FOB', incoterm_name: 'Free on Board' },
    { id: 'inc2', incoterm_code: 'CIF', incoterm_name: 'Cost, Insurance & Freight' },
    { id: 'inc3', incoterm_code: 'EXW', incoterm_name: 'Ex Works' },
    { id: 'inc4', incoterm_code: 'DDP', incoterm_name: 'Delivered Duty Paid' },
    { id: 'inc5', incoterm_code: 'CFR', incoterm_name: 'Cost and Freight' }
  ],
  charges: [
    { id: 'ch1', charge_name: 'Ocean Freight Charge' },
    { id: 'ch2', charge_name: 'Terminal Handling Charge (THC)' },
    { id: 'ch3', charge_name: 'Documentation Fee' },
    { id: 'ch4', charge_name: 'Customs Clearance Fee' },
    { id: 'ch5', charge_name: 'Bunker Adjustment Factor (BAF)' }
  ]
};

const ShipmentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});

  // Master Data state for dropdowns
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [countries, setCountries] = useState([]);
  const [ports, setPorts] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [packageTypes, setPackageTypes] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [transportModes, setTransportModes] = useState([]);
  const [shippingLines, setShippingLines] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [incoterms, setIncoterms] = useState([]);
  const [charges, setCharges] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    shipment_number: 'AUTO-GENERATED',
    shipment_date: new Date().toISOString().split('T')[0],
    customer_id: '',
    vendor_id: '',
    agent_id: '',
    shipment_type: 'Export',
    service_type_id: '',
    sales_person_id: '',
    operation_executive_id: '',

    // Cargo
    commodity_id: '',
    package_type_id: '',
    uom_id: '',
    gross_weight: '',
    volume_cbm: '',
    no_of_packages: '',
    is_dangerous_goods: false,

    // Route
    origin_country_id: '',
    origin_port_id: '',
    destination_country_id: '',
    destination_port_id: '',
    final_destination: '',

    // Transport
    transport_mode_id: '',
    shipping_line_id: '',
    vehicle_id: '',
    warehouse_id: '',
    etd: '',
    eta: '',

    // Commercial
    currency_id: '',
    exchange_rate: '1.0000',
    payment_term_id: '',
    incoterm_id: '',
    charge_id: '',

    status: 'Draft',
    remarks: ''
  });

  useEffect(() => {
    loadMasters();
    if (isEditMode) {
      fetchShipmentDetails();
    }
  }, [id]);

  const extractArray = (result, defaultKey) => {
    if (!result || result.status !== 'fulfilled' || !result.value) {
      return DEFAULT_MASTERS[defaultKey] || [];
    }

    const val = result.value;
    let items = [];

    if (val?.data?.data && Array.isArray(val.data.data)) {
      items = val.data.data;
    } else if (val?.data && Array.isArray(val.data)) {
      items = val.data;
    } else if (val?.data?.rows && Array.isArray(val.data.rows)) {
      items = val.data.rows;
    } else if (Array.isArray(val)) {
      items = val;
    }

    return items.length > 0 ? items : (DEFAULT_MASTERS[defaultKey] || []);
  };

  const loadMasters = async () => {
    try {
      const [
        custRes, vendRes, empRes, countryRes, portRes,
        commRes, pkgRes, uomRes, transRes, lineRes,
        vehRes, whRes, currRes, payRes, incoRes, chgRes
      ] = await Promise.allSettled([
        businessService.getCustomers({ page: 1, limit: 1000 }),
        businessService.getVendors({ page: 1, limit: 1000 }),
        organizationService.getEmployees({ page: 1, limit: 1000 }),
        foundationService.getCountries({ page: 1, limit: 1000 }),
        logisticsService.getPorts({ page: 1, limit: 1000 }),
        businessService.getCommodities({ page: 1, limit: 1000 }),
        commonService.getPackageTypes({ page: 1, limit: 1000 }),
        commonService.getUOMs({ page: 1, limit: 1000 }),
        commonService.getTransportModes({ page: 1, limit: 1000 }),
        logisticsService.getShippingLines({ page: 1, limit: 1000 }),
        logisticsService.getVehicles({ page: 1, limit: 1000 }),
        logisticsService.getWarehouses({ page: 1, limit: 1000 }),
        foundationService.getCurrencies({ page: 1, limit: 1000 }),
        foundationService.getPaymentTerms({ page: 1, limit: 1000 }),
        commonService.getIncoterms({ page: 1, limit: 1000 }),
        businessService.getCharges({ page: 1, limit: 1000 })
      ]);

      setCustomers(extractArray(custRes, 'customers'));
      setVendors(extractArray(vendRes, 'vendors'));
      setEmployees(extractArray(empRes, 'employees'));
      setCountries(extractArray(countryRes, 'countries'));
      setPorts(extractArray(portRes, 'ports'));
      setCommodities(extractArray(commRes, 'commodities'));
      setPackageTypes(extractArray(pkgRes, 'packageTypes'));
      setUoms(extractArray(uomRes, 'uoms'));
      setTransportModes(extractArray(transRes, 'transportModes'));
      setShippingLines(extractArray(lineRes, 'shippingLines'));
      setVehicles(extractArray(vehRes, 'vehicles'));
      setWarehouses(extractArray(whRes, 'warehouses'));
      setCurrencies(extractArray(currRes, 'currencies'));
      setPaymentTerms(extractArray(payRes, 'paymentTerms'));
      setIncoterms(extractArray(incoRes, 'incoterms'));
      setCharges(extractArray(chgRes, 'charges'));

    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const fetchShipmentDetails = async () => {
    setIsLoading(true);
    try {
      const res = await operationsService.getShipmentById(id);
      const data = res?.data?.data || res?.data;
      if (data) {
        setFormData({
          shipment_number: data.shipment_number || 'AUTO',
          shipment_date: data.shipment_date || '',
          customer_id: data.customer_id || '',
          vendor_id: data.vendor_id || '',
          agent_id: data.agent_id || '',
          shipment_type: data.shipment_type || 'Export',
          service_type_id: data.service_type_id || '',
          sales_person_id: data.sales_person_id || '',
          operation_executive_id: data.operation_executive_id || '',

          commodity_id: data.commodity_id || '',
          package_type_id: data.package_type_id || '',
          uom_id: data.uom_id || '',
          gross_weight: data.gross_weight || '',
          volume_cbm: data.volume_cbm || '',
          no_of_packages: data.no_of_packages || '',
          is_dangerous_goods: !!data.is_dangerous_goods,

          origin_country_id: data.origin_country_id || '',
          origin_port_id: data.origin_port_id || '',
          destination_country_id: data.destination_country_id || '',
          destination_port_id: data.destination_port_id || '',
          final_destination: data.final_destination || '',

          transport_mode_id: data.transport_mode_id || '',
          shipping_line_id: data.shipping_line_id || '',
          vehicle_id: data.vehicle_id || '',
          warehouse_id: data.warehouse_id || '',
          etd: data.etd || '',
          eta: data.eta || '',

          currency_id: data.currency_id || '',
          exchange_rate: data.exchange_rate || '1.0000',
          payment_term_id: data.payment_term_id || '',
          incoterm_id: data.incoterm_id || '',
          charge_id: data.charge_id || '',

          status: data.status || 'Draft',
          remarks: data.remarks || ''
        });
      }
    } catch (error) {
      console.error('Error fetching shipment details:', error);
      toast.error('Failed to load shipment details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.shipment_date) newErrors.shipment_date = 'Shipment date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, targetStatus = null) => {
    if (e) e.preventDefault();

    if (!validate()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      status: targetStatus || formData.status
    };

    try {
      if (isEditMode) {
        await operationsService.updateShipment(id, payload);
        toast.success('Shipment updated successfully!');
      } else {
        await operationsService.createShipment(payload);
        toast.success('Shipment created successfully!');
      }
      navigate('/company/operations/shipments');
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save shipment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Page>
        <div className="p-xl text-center">
          <Loader size="lg" />
          <p className="mt-md text-secondary">Loading shipment details...</p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title={isEditMode ? `Edit Shipment: ${formData.shipment_number}` : 'Create New Shipment'}
        subtitle="Specify cargo, route, transport mode, and commercial details"
        primaryAction={{
          label: 'Back to List',
          icon: ArrowLeft,
          variant: 'outline',
          onClick: () => navigate('/company/operations/shipments')
        }}
      />

      <form onSubmit={(e) => handleSubmit(e)} className="dense-form">
        {/* SECTION 1: GENERAL INFORMATION */}
        <div className="bg-surface border-light rounded-lg shadow-sm p-lg mb-lg">
          <h3 className="text-md font-semibold text-primary mb-md border-b-light pb-xs flex items-center gap-xs">
            1. General Information
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Shipment Number</label>
              <input 
                type="text" 
                value={formData.shipment_number} 
                disabled 
                className="form-control form-control-sm bg-neutral-light"
              />
            </div>

            <div className="form-group">
              <label>Shipment Date <span className="text-danger">*</span></label>
              <input 
                type="date" 
                name="shipment_date" 
                value={formData.shipment_date} 
                onChange={handleChange} 
                className={`form-control form-control-sm ${errors.shipment_date ? 'is-invalid' : ''}`}
              />
              {errors.shipment_date && <span className="text-danger text-xs mt-xs">{errors.shipment_date}</span>}
            </div>

            <div className="form-group">
              <label>Shipment Type</label>
              <select 
                name="shipment_type" 
                value={formData.shipment_type} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="Export">Export</option>
                <option value="Import">Import</option>
                <option value="Domestic">Domestic</option>
                <option value="Cross-Trade">Cross-Trade</option>
              </select>
            </div>

            <div className="form-group">
              <label>Customer <span className="text-danger">*</span></label>
              <select 
                name="customer_id" 
                value={formData.customer_id} 
                onChange={handleChange}
                className={`form-control form-control-sm ${errors.customer_id ? 'is-invalid' : ''}`}
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name || c.name} {c.customer_code ? `(${c.customer_code})` : ''}
                  </option>
                ))}
              </select>
              {errors.customer_id && <span className="text-danger text-xs mt-xs">{errors.customer_id}</span>}
            </div>

            <div className="form-group">
              <label>Vendor</label>
              <select 
                name="vendor_id" 
                value={formData.vendor_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Vendor --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_name || v.name} {v.vendor_code ? `(${v.vendor_code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Agent</label>
              <select 
                name="agent_id" 
                value={formData.agent_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Agent --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_name || v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Sales Person</label>
              <select 
                name="sales_person_id" 
                value={formData.sales_person_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Sales Person --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.first_name ? `${e.first_name} ${e.last_name || ''}` : (e.employee_name || e.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Operation Executive</label>
              <select 
                name="operation_executive_id" 
                value={formData.operation_executive_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Operation Exec --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.first_name ? `${e.first_name} ${e.last_name || ''}` : (e.employee_name || e.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: CARGO INFORMATION */}
        <div className="bg-surface border-light rounded-lg shadow-sm p-lg mb-lg">
          <h3 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">
            2. Cargo Information
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Commodity</label>
              <select 
                name="commodity_id" 
                value={formData.commodity_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Commodity --</option>
                {commodities.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.commodity_name || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Package Type</label>
              <select 
                name="package_type_id" 
                value={formData.package_type_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Package Type --</option>
                {packageTypes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.package_type_name || p.type_name || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>UOM</label>
              <select 
                name="uom_id" 
                value={formData.uom_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select UOM --</option>
                {uoms.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.uom_name || u.name} {u.uom_code ? `(${u.uom_code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Gross Weight (kg)</label>
              <input 
                type="number" 
                step="0.01"
                name="gross_weight" 
                value={formData.gross_weight} 
                onChange={handleChange}
                className="form-control form-control-sm"
                placeholder="e.g. 1500.00"
              />
            </div>

            <div className="form-group">
              <label>Volume (CBM)</label>
              <input 
                type="number" 
                step="0.01"
                name="volume_cbm" 
                value={formData.volume_cbm} 
                onChange={handleChange}
                className="form-control form-control-sm"
                placeholder="e.g. 12.50"
              />
            </div>

            <div className="form-group">
              <label>No Of Packages</label>
              <input 
                type="number" 
                name="no_of_packages" 
                value={formData.no_of_packages} 
                onChange={handleChange}
                className="form-control form-control-sm"
                placeholder="e.g. 50"
              />
            </div>

            <div className="form-group flex align-center gap-xs mt-md">
              <label className="flex align-center gap-xs cursor-pointer font-medium">
                <input 
                  type="checkbox" 
                  name="is_dangerous_goods" 
                  checked={formData.is_dangerous_goods} 
                  onChange={handleChange}
                />
                Dangerous Goods (HAZMAT)
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: ROUTE INFORMATION */}
        <div className="bg-surface border-light rounded-lg shadow-sm p-lg mb-lg">
          <h3 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">
            3. Route Information
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Origin Country</label>
              <select 
                name="origin_country_id" 
                value={formData.origin_country_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Origin Country --</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.country_name || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Origin Port</label>
              <select 
                name="origin_port_id" 
                value={formData.origin_port_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Origin Port --</option>
                {ports.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.port_name || p.name} {p.port_code ? `(${p.port_code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Destination Country</label>
              <select 
                name="destination_country_id" 
                value={formData.destination_country_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Destination Country --</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.country_name || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Destination Port</label>
              <select 
                name="destination_port_id" 
                value={formData.destination_port_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Destination Port --</option>
                {ports.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.port_name || p.name} {p.port_code ? `(${p.port_code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Final Destination</label>
              <input 
                type="text" 
                name="final_destination" 
                value={formData.final_destination} 
                onChange={handleChange}
                className="form-control form-control-sm"
                placeholder="e.g. Chicago Door Delivery"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: TRANSPORT INFORMATION */}
        <div className="bg-surface border-light rounded-lg shadow-sm p-lg mb-lg">
          <h3 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">
            4. Transport Information
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Transport Mode</label>
              <select 
                name="transport_mode_id" 
                value={formData.transport_mode_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Transport Mode --</option>
                {transportModes.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.mode_name || t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Shipping Line / Carrier</label>
              <select 
                name="shipping_line_id" 
                value={formData.shipping_line_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Shipping Line --</option>
                {shippingLines.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.shipping_line_name || s.line_name || s.name} {s.shipping_line_code ? `(${s.shipping_line_code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Vehicle</label>
              <select 
                name="vehicle_id" 
                value={formData.vehicle_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.vehicle_number || v.vehicle_no || v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Warehouse</label>
              <select 
                name="warehouse_id" 
                value={formData.warehouse_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Warehouse --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.warehouse_name || w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>ETD (Departure Date)</label>
              <input 
                type="date" 
                name="etd" 
                value={formData.etd} 
                onChange={handleChange}
                className="form-control form-control-sm"
              />
            </div>

            <div className="form-group">
              <label>ETA (Arrival Date)</label>
              <input 
                type="date" 
                name="eta" 
                value={formData.eta} 
                onChange={handleChange}
                className="form-control form-control-sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: COMMERCIAL INFORMATION */}
        <div className="bg-surface border-light rounded-lg shadow-sm p-lg mb-lg">
          <h3 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">
            5. Commercial Information
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Currency</label>
              <select 
                name="currency_id" 
                value={formData.currency_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Currency --</option>
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.currency_name || c.name} {c.currency_code ? `(${c.currency_code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Exchange Rate</label>
              <input 
                type="number" 
                step="0.0001"
                name="exchange_rate" 
                value={formData.exchange_rate} 
                onChange={handleChange}
                className="form-control form-control-sm"
              />
            </div>

            <div className="form-group">
              <label>Payment Terms</label>
              <select 
                name="payment_term_id" 
                value={formData.payment_term_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Payment Term --</option>
                {paymentTerms.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.payment_term_name || p.term_name || p.name} {p.payment_term_code ? `(${p.payment_term_code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Incoterm</label>
              <select 
                name="incoterm_id" 
                value={formData.incoterm_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Incoterm --</option>
                {incoterms.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.incoterm_code ? `${i.incoterm_code} - ` : ''}{i.incoterm_name || i.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Default Charge</label>
              <select 
                name="charge_id" 
                value={formData.charge_id} 
                onChange={handleChange}
                className="form-control form-control-sm"
              >
                <option value="">-- Select Charge --</option>
                {charges.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.charge_name || ch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 6: REMARKS */}
        <div className="bg-surface border-light rounded-lg shadow-sm p-lg mb-lg">
          <h3 className="text-md font-semibold text-primary mb-md border-b-light pb-xs">
            6. Remarks & Special Instructions
          </h3>
          <div className="form-group">
            <textarea 
              name="remarks" 
              rows="3" 
              value={formData.remarks} 
              onChange={handleChange}
              className="form-control"
              placeholder="Add operational notes, cargo handling instructions, or client requirements..."
            />
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="flex justify-end gap-sm p-md bg-surface border-light rounded-lg shadow-sm sticky bottom-0 z-10">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/company/operations/shipments')}
            disabled={isSubmitting}
            leftIcon={X}
          >
            Cancel
          </Button>

          <Button 
            type="button" 
            variant="secondary" 
            onClick={(e) => handleSubmit(e, 'Draft')}
            disabled={isSubmitting}
            leftIcon={FileText}
          >
            Save Draft
          </Button>

          <Button 
            type="submit" 
            variant="primary" 
            onClick={(e) => handleSubmit(e, 'Confirmed')}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            leftIcon={Save}
          >
            {isEditMode ? 'Update & Confirm' : 'Save & Confirm'}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default ShipmentFormPage;
