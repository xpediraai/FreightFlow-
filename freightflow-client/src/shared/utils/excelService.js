import * as XLSX from 'xlsx';

/**
 * Master Schema Registry - Strictly matched to Form & Sequelize Model Fields
 */
export const MASTER_SCHEMAS = {
  charge: {
    title: 'Charge Master',
    filename: 'Charge_Master_Template.xlsx',
    uniqueKeys: ['charge_code'],
    headers: [
      { key: 'charge_code', label: 'Charge Code *', required: true, type: 'string' },
      { key: 'charge_name', label: 'Charge Name *', required: true, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Charge Code *': 'CHG-FREIGHT',
        'Charge Name *': 'Ocean Freight Charge',
        'Status': 'Active'
      },
      {
        'Charge Code *': 'CHG-DOC',
        'Charge Name *': 'Documentation Fee',
        'Status': 'Active'
      }
    ]
  },
  country: {
    title: 'Country Master',
    filename: 'Country_Master_Template.xlsx',
    uniqueKeys: ['country_code'],
    headers: [
      { key: 'country_code', label: 'Country Code *', required: true, type: 'string' },
      { key: 'country_name', label: 'Country Name *', required: true, type: 'string' },
      { key: 'phone_code', label: 'Phone Code', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Country Code *': 'US',
        'Country Name *': 'United States',
        'Phone Code': '+1',
        'Status': 'Active'
      },
      {
        'Country Code *': 'IN',
        'Country Name *': 'India',
        'Phone Code': '+91',
        'Status': 'Active'
      }
    ]
  },
  state: {
    title: 'State Master',
    filename: 'State_Master_Template.xlsx',
    uniqueKeys: ['country_code', 'state_code'],
    headers: [
      { key: 'country_code', label: 'Country *', required: true, type: 'string' },
      { key: 'state_code', label: 'State Code *', required: true, type: 'string' },
      { key: 'state_name', label: 'State Name *', required: true, type: 'string' },
      { key: 'gst_state_code', label: 'GST State Code', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Country *': 'India',
        'State Code *': 'MH',
        'State Name *': 'Maharashtra',
        'GST State Code': '27',
        'Status': 'Active'
      },
      {
        'Country *': 'United States',
        'State Code *': 'CA',
        'State Name *': 'California',
        'GST State Code': '06',
        'Status': 'Active'
      }
    ]
  },
  city: {
    title: 'City Master',
    filename: 'City_Master_Template.xlsx',
    uniqueKeys: ['country_code', 'state_code', 'city_code'],
    headers: [
      { key: 'country_code', label: 'Country *', required: true, type: 'string' },
      { key: 'state_code', label: 'State *', required: true, type: 'string' },
      { key: 'city_code', label: 'City Code *', required: true, type: 'string' },
      { key: 'city_name', label: 'City Name *', required: true, type: 'string' },
      { key: 'gst', label: 'GST Code', required: false, type: 'string' },
      { key: 'pincode', label: 'Pincode', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Country *': 'India',
        'State *': 'MH',
        'City Code *': 'BOM',
        'City Name *': 'Mumbai',
        'GST Code': '27',
        'Pincode': '400001',
        'Status': 'Active'
      }
    ]
  },
  port: {
    title: 'Port Master',
    filename: 'Port_Master_Template.xlsx',
    uniqueKeys: ['port_code'],
    headers: [
      { key: 'port_code', label: 'Port Code *', required: true, type: 'string' },
      { key: 'port_name', label: 'Port Name *', required: true, type: 'string' },
      { key: 'country_code', label: 'Country *', required: true, type: 'string' },
      { key: 'state_code', label: 'State', required: false, type: 'string' },
      { key: 'city_name', label: 'City', required: false, type: 'string' },
      { key: 'time_zone', label: 'Time Zone', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Port Code *': 'INBOM',
        'Port Name *': 'Jawaharlal Nehru Port (Nhava Sheva)',
        'Country *': 'India',
        'State': 'MH',
        'City': 'Mumbai',
        'Time Zone': 'Asia/Kolkata',
        'Status': 'Active'
      }
    ]
  },
  containerType: {
    title: 'Container Type Master',
    filename: 'ContainerType_Master_Template.xlsx',
    uniqueKeys: ['container_code'],
    headers: [
      { key: 'container_code', label: 'Container Code *', required: true, type: 'string' },
      { key: 'container_name', label: 'Container Name *', required: true, type: 'string' },
      { key: 'iso_code', label: 'ISO Code *', required: true, type: 'string' },
      { key: 'size', label: 'Size (FT) *', required: true, type: 'select', options: ['20', '40', '45'] },
      { key: 'category', label: 'Category *', required: true, type: 'select', options: ['Dry', 'Reefer', 'Open Top', 'Flat Rack', 'Tank'] },
      { key: 'capacity_cbm', label: 'Capacity (CBM)', required: false, type: 'number' },
      { key: 'max_weight', label: 'Max Weight (KG)', required: false, type: 'number' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Container Code *': '20GP',
        'Container Name *': '20ft General Purpose',
        'ISO Code *': '22G1',
        'Size (FT) *': '20',
        'Category *': 'Dry',
        'Capacity (CBM)': 33.2,
        'Max Weight (KG)': 28000,
        'Status': 'Active'
      }
    ]
  },
  department: {
    title: 'Department Master',
    filename: 'Department_Master_Template.xlsx',
    uniqueKeys: ['department_code'],
    headers: [
      { key: 'department_code', label: 'Department Code *', required: true, type: 'string' },
      { key: 'department_name', label: 'Department Name *', required: true, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Department Code *': 'LOG-OPS',
        'Department Name *': 'Logistics Operations',
        'Description': 'Freight forwarding operations',
        'Status': 'Active'
      }
    ]
  },
  designation: {
    title: 'Designation Master',
    filename: 'Designation_Master_Template.xlsx',
    uniqueKeys: ['designation_code'],
    headers: [
      { key: 'designation_code', label: 'Designation Code *', required: true, type: 'string' },
      { key: 'designation_name', label: 'Designation Name *', required: true, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Designation Code *': 'OPS-MGR',
        'Designation Name *': 'Operations Manager',
        'Description': 'Manages daily shipment flows',
        'Status': 'Active'
      }
    ]
  },
  incoterm: {
    title: 'Incoterm Master',
    filename: 'Incoterm_Master_Template.xlsx',
    uniqueKeys: ['incoterm_code'],
    headers: [
      { key: 'incoterm_code', label: 'Incoterm Code *', required: true, type: 'string' },
      { key: 'incoterm_name', label: 'Incoterm Name *', required: true, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Incoterm Code *': 'FOB',
        'Incoterm Name *': 'Free On Board',
        'Description': 'Seller delivers when goods pass ship rail',
        'Status': 'Active'
      }
    ]
  },
  commodity: {
    title: 'Commodity Master',
    filename: 'Commodity_Master_Template.xlsx',
    uniqueKeys: ['commodity_code'],
    headers: [
      { key: 'commodity_code', label: 'Commodity Code *', required: true, type: 'string' },
      { key: 'commodity_name', label: 'Commodity Name *', required: true, type: 'string' },
      { key: 'hs_code', label: 'HS Code', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Commodity Code *': 'CMD-ELEC',
        'Commodity Name *': 'Consumer Electronics',
        'HS Code': '85171200',
        'Status': 'Active'
      }
    ]
  },
  uom: {
    title: 'UOM Master',
    filename: 'UOM_Master_Template.xlsx',
    uniqueKeys: ['uom_code'],
    headers: [
      { key: 'uom_code', label: 'UOM Code *', required: true, type: 'string' },
      { key: 'uom_name', label: 'UOM Name *', required: true, type: 'string' },
      { key: 'uom_type', label: 'UOM Type', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'UOM Code *': 'KGS',
        'UOM Name *': 'Kilograms',
        'UOM Type': 'Weight',
        'Status': 'Active'
      }
    ]
  },
  customer: {
    title: 'Customer Master',
    filename: 'Customer_Master_Template.xlsx',
    uniqueKeys: ['customer_code'],
    headers: [
      { key: 'customer_code', label: 'Customer Code *', required: true, type: 'string' },
      { key: 'customer_name', label: 'Customer Name *', required: true, type: 'string' },
      { key: 'gst_number', label: 'GST Number', required: false, type: 'string' },
      { key: 'pan_number', label: 'PAN Number', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Customer Code *': 'CUST-001',
        'Customer Name *': 'Global Trading Corp',
        'GST Number': '27AAAAA0000A1Z5',
        'PAN Number': 'AAAAA0000A',
        'Status': 'Active'
      }
    ]
  },
  vendor: {
    title: 'Vendor Master',
    filename: 'Vendor_Master_Template.xlsx',
    uniqueKeys: ['vendor_code'],
    headers: [
      { key: 'vendor_code', label: 'Vendor Code *', required: true, type: 'string' },
      { key: 'vendor_name', label: 'Vendor Name *', required: true, type: 'string' },
      { key: 'vendor_type', label: 'Vendor Type', required: false, type: 'string' },
      { key: 'gst_number', label: 'GST Number', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Vendor Code *': 'VND-001',
        'Vendor Name *': 'Maersk Line India',
        'Vendor Type': 'Shipping Line',
        'GST Number': '27BBBBB0000B1Z6',
        'Status': 'Active'
      }
    ]
  },
  currency: {
    title: 'Currency Master',
    filename: 'Currency_Master_Template.xlsx',
    uniqueKeys: ['currency_code'],
    headers: [
      { key: 'currency_code', label: 'Currency Code *', required: true, type: 'string' },
      { key: 'currency_name', label: 'Currency Name *', required: true, type: 'string' },
      { key: 'symbol', label: 'Symbol', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      { 'Currency Code *': 'USD', 'Currency Name *': 'US Dollar', 'Symbol': '$', 'Status': 'Active' }
    ]
  },
  paymentTerm: {
    title: 'Payment Term Master',
    filename: 'PaymentTerm_Master_Template.xlsx',
    uniqueKeys: ['payment_term_code'],
    headers: [
      { key: 'payment_term_code', label: 'Payment Term Code *', required: true, type: 'string' },
      { key: 'payment_term_name', label: 'Payment Term Name *', required: true, type: 'string' },
      { key: 'credit_days', label: 'Credit Days', required: false, type: 'number' },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      { 'Payment Term Code *': 'NET30', 'Payment Term Name *': 'Net 30 Days', 'Credit Days': 30, 'Description': '30 Days Net Payment', 'Status': 'Active' }
    ]
  },
  shippingLine: {
    title: 'Shipping Line Master',
    filename: 'ShippingLine_Master_Template.xlsx',
    uniqueKeys: ['shipping_line_code'],
    headers: [
      { key: 'shipping_line_code', label: 'Shipping Line Code *', required: true, type: 'string' },
      { key: 'shipping_line_name', label: 'Shipping Line Name *', required: true, type: 'string' },
      { key: 'scac_code', label: 'SCAC Code', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      { 'Shipping Line Code *': 'MAEU', 'Shipping Line Name *': 'Maersk Line', 'SCAC Code': 'MAEU', 'Status': 'Active' }
    ]
  },
  driver: {
    title: 'Driver Master',
    filename: 'Driver_Master_Template.xlsx',
    uniqueKeys: ['license_number'],
    headers: [
      { key: 'driver_name', label: 'Driver Name *', required: true, type: 'string' },
      { key: 'license_number', label: 'License Number *', required: true, type: 'string' },
      { key: 'mobile_number', label: 'Mobile Number', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      { 'Driver Name *': 'Rajesh Kumar', 'License Number *': 'DL-1420110012345', 'Mobile Number': '9876543210', 'Status': 'Active' }
    ]
  },
  vehicle: {
    title: 'Vehicle Master',
    filename: 'Vehicle_Master_Template.xlsx',
    uniqueKeys: ['vehicle_number'],
    headers: [
      { key: 'vehicle_number', label: 'Vehicle Number *', required: true, type: 'string' },
      { key: 'vehicle_type', label: 'Vehicle Type', required: false, type: 'string' },
      { key: 'capacity_tons', label: 'Capacity (Tons)', required: false, type: 'number' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      { 'Vehicle Number *': 'MH04AB1234', 'Vehicle Type': 'Trailer 40ft', 'Capacity (Tons)': 25, 'Status': 'Active' }
    ]
  },
  warehouse: {
    title: 'Warehouse Master',
    filename: 'Warehouse_Master_Template.xlsx',
    uniqueKeys: ['warehouse_code'],
    headers: [
      { key: 'warehouse_code', label: 'Warehouse Code *', required: true, type: 'string' },
      { key: 'warehouse_name', label: 'Warehouse Name *', required: true, type: 'string' },
      { key: 'pincode', label: 'Pincode', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      { 'Warehouse Code *': 'WH-BOM01', 'Warehouse Name *': 'Nhava Sheva CFS Warehouse', 'Pincode': '400707', 'Status': 'Active' }
    ]
  },
  packageType: {
    title: 'Package Type Master',
    filename: 'PackageType_Master_Template.xlsx',
    uniqueKeys: ['package_type_code'],
    headers: [
      { key: 'package_type_code', label: 'Package Type Code *', required: true, type: 'string' },
      { key: 'package_type_name', label: 'Package Type Name *', required: true, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      { 'Package Type Code *': 'PLT', 'Package Type Name *': 'Wooden Pallet', 'Description': 'Standard Euro Pallet', 'Status': 'Active' }
    ]
  },
  transportMode: {
    title: 'Transport Mode Master',
    filename: 'TransportMode_Master_Template.xlsx',
    uniqueKeys: ['mode_code'],
    headers: [
      { key: 'mode_code', label: 'Mode Code *', required: true, type: 'string' },
      { key: 'mode_name', label: 'Mode Name *', required: true, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      { 'Mode Code *': 'SEA', 'Mode Name *': 'Sea Freight', 'Status': 'Active' }
    ]
  },
  employee: {
    title: 'Employee Master',
    filename: 'Employee_Master_Template.xlsx',
    uniqueKeys: ['employee_code'],
    headers: [
      { key: 'employee_code', label: 'Employee Code *', required: true, type: 'string' },
      { key: 'first_name', label: 'First Name *', required: true, type: 'string' },
      { key: 'last_name', label: 'Last Name', required: false, type: 'string' },
      { key: 'email', label: 'Email', required: false, type: 'email' },
      { key: 'mobile', label: 'Mobile Number', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      { 'Employee Code *': 'EMP-001', 'First Name *': 'Amit', 'Last Name': 'Sharma', 'Email': 'amit.sharma@company.com', 'Mobile Number': '9876543210', 'Status': 'Active' }
    ]
  }
};

/**
 * Downloads Excel template for a specific master entity type
 */
export const downloadTemplate = (entityType) => {
  const schema = MASTER_SCHEMAS[entityType];
  if (!schema) {
    throw new Error(`Invalid entity type: ${entityType}`);
  }

  const worksheet = XLSX.utils.json_to_sheet(schema.sampleData);
  
  // Apply auto column widths
  const colWidths = schema.headers.map(h => ({
    wch: Math.max(h.label.length + 4, 15)
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  XLSX.writeFile(workbook, schema.filename || `${entityType}_template.xlsx`);
};

/**
 * Parses uploaded Excel file into raw JSON rows
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse sheet to array of raw objects
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(rawRows);
      } catch (err) {
        reject(new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading uploaded file.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Helper to normalize string for comparison
 */
const normalizeHeader = (str) => {
  if (!str) return '';
  return String(str).replace(/\*/g, '').trim().toLowerCase();
};

/**
 * Validates parsed Excel rows against master schema rules and existing DB records
 */
export const validateMasterRows = (entityType, rawRows, existingDbRecords = []) => {
  const schema = MASTER_SCHEMAS[entityType];
  if (!schema) {
    throw new Error(`Schema not defined for entity: ${entityType}`);
  }

  const uniqueKeySet = new Set();
  const evaluatedRows = [];

  // Build lookup index for existing DB records using uniqueKeys
  const dbIndexMap = new Map();
  existingDbRecords.forEach((record) => {
    const compositeDbKey = schema.uniqueKeys
      .map(k => String(record[k] || '').trim().toLowerCase())
      .join('::');
    if (compositeDbKey) {
      dbIndexMap.set(compositeDbKey, record.id || record._id);
    }
  });

  rawRows.forEach((rawRow, index) => {
    const rowErrors = {};
    const mappedData = {};

    // Map human header labels to schema internal keys
    schema.headers.forEach((header) => {
      let rawVal = undefined;

      // Check if rawRow has direct internal key value (from live UI inline edit)
      if (rawRow[header.key] !== undefined && rawRow[header.key] !== null) {
        rawVal = rawRow[header.key];
      } else {
        // Find matching key in rawRow ignoring casing/spaces/*
        const rawHeaderKey = Object.keys(rawRow).find(
          (rk) => normalizeHeader(rk) === normalizeHeader(header.label) || normalizeHeader(rk) === normalizeHeader(header.key)
        );
        if (rawHeaderKey !== undefined) {
          rawVal = rawRow[rawHeaderKey];
        }
      }

      if (rawVal !== undefined && rawVal !== null) {
        rawVal = String(rawVal).trim();
      } else {
        rawVal = '';
      }

      // Convert Boolean select strings if applicable
      if (header.type === 'select' && (header.options.includes('Yes') || header.options.includes('No'))) {
        if (rawVal.toLowerCase() === 'true' || rawVal.toLowerCase() === 'yes') rawVal = 'Yes';
        if (rawVal.toLowerCase() === 'false' || rawVal.toLowerCase() === 'no') rawVal = 'No';
      }

      mappedData[header.key] = rawVal;

      // Field Level Validation
      if (header.required && !rawVal) {
        rowErrors[header.key] = `${header.label.replace(/\*/g, '').trim()} is required.`;
      } else if (rawVal) {
        if (header.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(rawVal)) {
            rowErrors[header.key] = 'Invalid email address format.';
          }
        } else if (header.type === 'number') {
          if (isNaN(Number(rawVal))) {
            rowErrors[header.key] = 'Must be a valid number.';
          }
        } else if (header.type === 'select' && header.options && header.options.length > 0) {
          const match = header.options.find(opt => String(opt).toLowerCase() === rawVal.toLowerCase());
          if (!match) {
            rowErrors[header.key] = `Invalid option. Allowed: ${header.options.join(', ')}`;
          } else {
            mappedData[header.key] = match; // normalize casing to option
          }
        }
      }
    });

    // Extract Composite Unique Key for File-Level & DB-Level Duplicate Check
    const compositeRowKey = schema.uniqueKeys
      .map(k => String(mappedData[k] || '').trim().toLowerCase())
      .join('::');

    if (compositeRowKey && compositeRowKey !== schema.uniqueKeys.map(() => '').join('::')) {
      if (uniqueKeySet.has(compositeRowKey)) {
        rowErrors['_row'] = `Duplicate record found in Excel file.`;
      } else {
        uniqueKeySet.add(compositeRowKey);
      }
    }

    // Determine Record Status (NEW, UPDATE, ERROR)
    let status = 'NEW';
    let dbId = null;

    if (compositeRowKey && dbIndexMap.has(compositeRowKey)) {
      status = 'UPDATE';
      dbId = dbIndexMap.get(compositeRowKey);
    }

    if (Object.keys(rowErrors).length > 0) {
      status = 'ERROR';
    }

    evaluatedRows.push({
      _id: `row_${index + 1}`,
      _status: status,
      _errors: rowErrors,
      _dbId: dbId,
      data: mappedData
    });
  });

  return evaluatedRows;
};
