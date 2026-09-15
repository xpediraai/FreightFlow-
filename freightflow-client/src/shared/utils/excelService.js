import * as XLSX from 'xlsx';

/**
 * Master Schema Registry - Strictly matched to Form & Sequelize Model Fields for all 22 Master modules
 */
export const MASTER_SCHEMAS = {
  charge: {
    title: 'Charge Master',
    filename: 'Charge_Master_Template.xlsx',
    uniqueKeys: ['charge_code'],
    headers: [
      { key: 'charge_code', label: 'Charge Code *', required: true, type: 'string' },
      { key: 'charge_name', label: 'Charge / Service Description *', required: true, type: 'string' },
      { 
        key: 'basis', 
        label: 'Basis / Unit *', 
        required: true, 
        type: 'select', 
        options: ['Per Container', 'Per BL Set', 'Flat / Lump sum', 'Per Vehicle', 'Per Set', 'Per CBM', 'Per MT', 'Per KG', 'Per Document', 'Per Day'] 
      },
      { key: 'default_rate', label: 'Default Rate', required: false, type: 'number' },
      { key: 'default_qty', label: 'Default Quantity', required: false, type: 'number' },
      { key: 'charge_type', label: 'Charge Type', required: false, type: 'select', options: ['Revenue', 'Expense'] },
      { key: 'default_applicable', label: 'Default Applicable in Quotation', required: false, type: 'select', options: ['Yes', 'No'] },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Charge Code *': 'OF',
        'Charge / Service Description *': 'Ocean Freight [POL to POD]',
        'Basis / Unit *': 'Per Container',
        'Default Rate': 85000,
        'Default Quantity': 1,
        'Charge Type': 'Revenue',
        'Default Applicable in Quotation': 'Yes',
        'Description': 'Standard Ocean Freight charges',
        'Status': 'Active'
      },
      {
        'Charge Code *': 'THC',
        'Charge / Service Description *': 'Terminal Handling Charge',
        'Basis / Unit *': 'Per Container',
        'Default Rate': 9500,
        'Default Quantity': 1,
        'Charge Type': 'Expense',
        'Default Applicable in Quotation': 'Yes',
        'Description': 'Origin Terminal Handling Charges',
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
        'Country Code *': 'IN',
        'Country Name *': 'India',
        'Phone Code': '+91',
        'Status': 'Active'
      },
      {
        'Country Code *': 'US',
        'Country Name *': 'United States',
        'Phone Code': '+1',
        'Status': 'Active'
      },
      {
        'Country Code *': 'AE',
        'Country Name *': 'United Arab Emirates',
        'Phone Code': '+971',
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
        'Country *': 'India',
        'State Code *': 'GJ',
        'State Name *': 'Gujarat',
        'GST State Code': '24',
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
      },
      {
        'Country *': 'India',
        'State *': 'GJ',
        'City Code *': 'AMD',
        'City Name *': 'Ahmedabad',
        'GST Code': '24',
        'Pincode': '380001',
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
        'Port Code *': 'INNSA',
        'Port Name *': 'Nhava Sheva (JNPT)',
        'Country *': 'India',
        'State': 'Maharashtra',
        'City': 'Navi Mumbai',
        'Time Zone': 'Asia/Kolkata',
        'Status': 'Active'
      },
      {
        'Port Code *': 'INMUN',
        'Port Name *': 'Mundra Port',
        'Country *': 'India',
        'State': 'Gujarat',
        'City': 'Mundra',
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
        'Container Name *': '20ft General Purpose Dry',
        'ISO Code *': '22G1',
        'Size (FT) *': '20',
        'Category *': 'Dry',
        'Capacity (CBM)': 33.2,
        'Max Weight (KG)': 28000,
        'Status': 'Active'
      },
      {
        'Container Code *': '40HC',
        'Container Name *': '40ft High Cube Dry',
        'ISO Code *': '45G1',
        'Size (FT) *': '40',
        'Category *': 'Dry',
        'Capacity (CBM)': 76.4,
        'Max Weight (KG)': 28600,
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
        'Description': 'Freight forwarding and shipping operations',
        'Status': 'Active'
      },
      {
        'Department Code *': 'SALES',
        'Department Name *': 'Sales & Marketing',
        'Description': 'Client acquisition and export rate quotes',
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
      { key: 'department_code', label: 'Department', required: false, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Designation Code *': 'OPS-MGR',
        'Designation Name *': 'Operations Manager',
        'Department': 'Logistics Operations',
        'Description': 'Oversees daily shipments and custom documentation',
        'Status': 'Active'
      },
      {
        'Designation Code *': 'DOC-EXEC',
        'Designation Name *': 'Documentation Executive',
        'Department': 'Logistics Operations',
        'Description': 'Handles BL release and shipping invoices',
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
      { key: 'transport_mode', label: 'Transport Mode', required: false, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Incoterm Code *': 'FOB',
        'Incoterm Name *': 'Free On Board',
        'Transport Mode': 'Sea',
        'Description': 'Seller delivers when goods pass the ship rail at named port',
        'Status': 'Active'
      },
      {
        'Incoterm Code *': 'CIF',
        'Incoterm Name *': 'Cost, Insurance and Freight',
        'Transport Mode': 'Sea',
        'Description': 'Seller pays freight and marine insurance to destination',
        'Status': 'Active'
      },
      {
        'Incoterm Code *': 'EXW',
        'Incoterm Name *': 'Ex Works',
        'Transport Mode': 'All',
        'Description': 'Buyer handles all transport from seller premises',
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
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'hazardous', label: 'Hazardous', required: false, type: 'select', options: ['Yes', 'No'] },
      { key: 'hazard_class', label: 'Hazard Class', required: false, type: 'string' },
      { key: 'default_unit', label: 'Default Unit', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Commodity Code *': 'CMD-CERAMIC',
        'Commodity Name *': 'Ceramic Tiles & Sanitaryware',
        'HS Code': '69072100',
        'Description': 'Polished vitrified floor tiles in wooden pallets',
        'Hazardous': 'No',
        'Hazard Class': '',
        'Default Unit': 'SQM',
        'Status': 'Active'
      },
      {
        'Commodity Code *': 'CMD-CHEM',
        'Commodity Name *': 'Industrial Solvents',
        'HS Code': '29051100',
        'Description': 'Methanol in ISO tank containers',
        'Hazardous': 'Yes',
        'Hazard Class': 'Class 3 - Flammable Liquid',
        'Default Unit': 'MT',
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
      { key: 'symbol', label: 'Symbol', required: false, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'UOM Code *': 'KGS',
        'UOM Name *': 'Kilograms',
        'Symbol': 'kg',
        'Description': 'Metric kilogram unit of weight',
        'Status': 'Active'
      },
      {
        'UOM Code *': 'CBM',
        'UOM Name *': 'Cubic Meter',
        'Symbol': 'm³',
        'Description': 'Volume measurement for cargo packing',
        'Status': 'Active'
      },
      {
        'UOM Code *': 'CONT',
        'UOM Name *': 'Container',
        'Symbol': 'ctr',
        'Description': 'Per container unit',
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
      { 
        key: 'customer_type', 
        label: 'Customer Type', 
        required: false, 
        type: 'select', 
        options: ['Shipper / Exporter', 'Consignee / Importer', 'Notify Party', 'Freight Forwarder', 'CHA / Custom Broker', 'Overseas Agent', 'Domestic Client', 'Other'] 
      },
      { 
        key: 'customer_category', 
        label: 'Customer Category', 
        required: false, 
        type: 'select', 
        options: ['Regular', 'VIP', 'Corporate', 'Occasional'] 
      },
      { key: 'gst_number', label: 'GST Number', required: false, type: 'string' },
      { key: 'pan_number', label: 'PAN Number', required: false, type: 'string' },
      { key: 'iec_code', label: 'IEC Code', required: false, type: 'string' },
      { key: 'cin_number', label: 'CIN Number', required: false, type: 'string' },
      { key: 'tan_number', label: 'TAN Number', required: false, type: 'string' },
      { key: 'credit_limit', label: 'Credit Limit', required: false, type: 'number' },
      { 
        key: 'payment_terms', 
        label: 'Payment Terms', 
        required: false, 
        type: 'select', 
        options: ['Advance / Prepaid', 'Net 7 Days', 'Net 15 Days', 'Net 30 Days', 'Net 45 Days', 'Net 60 Days', 'CAD (Cash Against Documents)', 'Letter of Credit (LC)', 'Custom'] 
      },
      { key: 'currency_code', label: 'Currency', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Customer Code *': 'CUST-001',
        'Customer Name *': 'Orient Ceramics Export Ltd',
        'Customer Type': 'Shipper / Exporter',
        'Customer Category': 'Corporate',
        'GST Number': '24AAACC1234F1Z5',
        'PAN Number': 'AAACC1234F',
        'IEC Code': '0812345678',
        'CIN Number': 'U26933GJ2015PLC081234',
        'TAN Number': 'AHMC12345A',
        'Credit Limit': 500000,
        'Payment Terms': 'Net 30 Days',
        'Currency': 'INR',
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
      { 
        key: 'vendor_type', 
        label: 'Vendor Type', 
        required: false, 
        type: 'select', 
        options: ['Shipping Line', 'Airlines', 'Transporter / Fleet', 'CHA / Customs Broker', 'CFS / ICD Yard', 'Overseas Agent', 'Warehouse Operator', 'Surveyor / Inspection', 'Other'] 
      },
      { key: 'gst_number', label: 'GST Number', required: false, type: 'string' },
      { key: 'pan_number', label: 'PAN Number', required: false, type: 'string' },
      { key: 'contact_person', label: 'Contact Person', required: false, type: 'string' },
      { key: 'mobile', label: 'Mobile Number', required: false, type: 'string' },
      { key: 'email', label: 'Email', required: false, type: 'email' },
      { key: 'country_code', label: 'Country', required: false, type: 'string' },
      { key: 'state_code', label: 'State', required: false, type: 'string' },
      { key: 'city_name', label: 'City', required: false, type: 'string' },
      { key: 'address', label: 'Address', required: false, type: 'string' },
      { key: 'currency_code', label: 'Currency', required: false, type: 'string' },
      { key: 'payment_terms', label: 'Payment Terms', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Vendor Code *': 'VND-001',
        'Vendor Name *': 'Maersk Line India Pvt Ltd',
        'Vendor Type': 'Shipping Line',
        'GST Number': '27AAACM1234A1Z1',
        'PAN Number': 'AAACM1234A',
        'Contact Person': 'Rajesh Deshmukh',
        'Mobile Number': '9876543210',
        'Email': 'in.import@maersk.com',
        'Country': 'India',
        'State': 'Maharashtra',
        'City': 'Mumbai',
        'Address': 'One International Center, Tower 2, Senapati Bapat Marg, Prabhadevi',
        'Currency': 'INR',
        'Payment Terms': 'Net 15 Days',
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
      { key: 'exchange_rate', label: 'Exchange Rate', required: false, type: 'number' },
      { key: 'base_currency', label: 'Base Currency', required: false, type: 'select', options: ['Yes', 'No'] },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Currency Code *': 'USD',
        'Currency Name *': 'United States Dollar',
        'Symbol': '$',
        'Exchange Rate': 86.50,
        'Base Currency': 'No',
        'Status': 'Active'
      },
      {
        'Currency Code *': 'INR',
        'Currency Name *': 'Indian Rupee',
        'Symbol': '₹',
        'Exchange Rate': 1.00,
        'Base Currency': 'Yes',
        'Status': 'Active'
      },
      {
        'Currency Code *': 'EUR',
        'Currency Name *': 'Euro',
        'Symbol': '€',
        'Exchange Rate': 94.20,
        'Base Currency': 'No',
        'Status': 'Active'
      }
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
      {
        'Payment Term Code *': 'NET30',
        'Payment Term Name *': 'Net 30 Days Credit',
        'Credit Days': 30,
        'Description': 'Payment due 30 days after invoice issuance',
        'Status': 'Active'
      },
      {
        'Payment Term Code *': 'ADV',
        'Payment Term Name *': '100% Advance Payment',
        'Credit Days': 0,
        'Description': 'Full payment required before booking release',
        'Status': 'Active'
      }
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
      { key: 'country_code', label: 'Country', required: false, type: 'string' },
      { key: 'contact_person', label: 'Contact Person', required: false, type: 'string' },
      { key: 'email', label: 'Email', required: false, type: 'email' },
      { key: 'phone', label: 'Phone Number', required: false, type: 'string' },
      { key: 'website', label: 'Website', required: false, type: 'string' },
      { key: 'tracking_url', label: 'Tracking URL', required: false, type: 'string' },
      { key: 'tracking_method', label: 'Tracking Method', required: false, type: 'select', options: ['GENERIC_FETCH', 'PUPPETEER_SCRAPE', 'REST_API'] },
      { key: 'bic_prefix', label: 'BIC Prefix', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Shipping Line Code *': 'MSK',
        'Shipping Line Name *': 'Maersk Line',
        'SCAC Code': 'MAEU',
        'Country': 'Denmark',
        'Contact Person': 'Operations Desk',
        'Email': 'customer.service@maersk.com',
        'Phone Number': '+45 3363 3363',
        'Website': 'https://www.maersk.com',
        'Tracking URL': 'https://www.maersk.com/tracking/{container_no}',
        'Tracking Method': 'GENERIC_FETCH',
        'BIC Prefix': 'MSKU,MRKU',
        'Status': 'Active'
      },
      {
        'Shipping Line Code *': 'MSC',
        'Shipping Line Name *': 'Mediterranean Shipping Company',
        'SCAC Code': 'MSCU',
        'Country': 'Switzerland',
        'Contact Person': 'Customer Care',
        'Email': 'info@msc.com',
        'Phone Number': '+41 227038888',
        'Website': 'https://www.msc.com',
        'Tracking URL': 'https://www.msc.com/track-a-shipment?number={container_no}',
        'Tracking Method': 'GENERIC_FETCH',
        'BIC Prefix': 'MSCU,MEDU',
        'Status': 'Active'
      }
    ]
  },
  driver: {
    title: 'Driver Master',
    filename: 'Driver_Master_Template.xlsx',
    uniqueKeys: ['license_number'],
    headers: [
      { key: 'driver_code', label: 'Driver Code *', required: true, type: 'string' },
      { key: 'driver_name', label: 'Driver Name *', required: true, type: 'string' },
      { key: 'mobile', label: 'Mobile Number', required: false, type: 'string' },
      { key: 'alternate_mobile', label: 'Alternate Mobile', required: false, type: 'string' },
      { key: 'email', label: 'Email', required: false, type: 'email' },
      { key: 'address', label: 'Address', required: false, type: 'string' },
      { key: 'country_code', label: 'Country', required: false, type: 'string' },
      { key: 'state_code', label: 'State', required: false, type: 'string' },
      { key: 'city_name', label: 'City', required: false, type: 'string' },
      { key: 'license_number', label: 'License Number *', required: true, type: 'string' },
      { key: 'license_type', label: 'License Type', required: false, type: 'string' },
      { key: 'license_expiry', label: 'License Expiry (YYYY-MM-DD)', required: false, type: 'string' },
      { key: 'aadhaar_number', label: 'Aadhaar Number', required: false, type: 'string' },
      { key: 'pan_number', label: 'PAN Number', required: false, type: 'string' },
      { key: 'vendor_code', label: 'Vendor', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Driver Code *': 'DRV-001',
        'Driver Name *': 'Ramesh Kumar Patel',
        'Mobile Number': '9825012345',
        'Alternate Mobile': '9825054321',
        'Email': 'ramesh.patel@gmail.com',
        'Address': 'B-12 Shanti Nagar, Ring Road',
        'Country': 'India',
        'State': 'Gujarat',
        'City': 'Surat',
        'License Number *': 'GJ-0520150012345',
        'License Type': 'Heavy Motor Vehicle (HMV)',
        'License Expiry (YYYY-MM-DD)': '2030-05-15',
        'Aadhaar Number': '123456789012',
        'PAN Number': 'ABCDE1234F',
        'Vendor': 'VND-001',
        'Status': 'Active'
      }
    ]
  },
  vehicle: {
    title: 'Vehicle Master',
    filename: 'Vehicle_Master_Template.xlsx',
    uniqueKeys: ['vehicle_number'],
    headers: [
      { key: 'vehicle_number', label: 'Vehicle Number *', required: true, type: 'string' },
      { 
        key: 'vehicle_type', 
        label: 'Vehicle Type', 
        required: false, 
        type: 'select', 
        options: ['Trailer 20ft', 'Trailer 40ft', 'Flatbed', 'Closed Container', 'Open Truck', 'LCV / Mini Truck', 'Tanker', 'Other'] 
      },
      { key: 'vehicle_capacity', label: 'Vehicle Capacity (Tons)', required: false, type: 'number' },
      { 
        key: 'vehicle_owner', 
        label: 'Vehicle Owner', 
        required: false, 
        type: 'select', 
        options: ['Own', 'Vendor', 'Attached'] 
      },
      { key: 'vendor_code', label: 'Vendor', required: false, type: 'string' },
      { key: 'registration_number', label: 'Registration Number', required: false, type: 'string' },
      { key: 'registration_expiry', label: 'Registration Expiry (YYYY-MM-DD)', required: false, type: 'string' },
      { key: 'insurance_number', label: 'Insurance Number', required: false, type: 'string' },
      { key: 'insurance_expiry', label: 'Insurance Expiry (YYYY-MM-DD)', required: false, type: 'string' },
      { key: 'fitness_expiry', label: 'Fitness Expiry (YYYY-MM-DD)', required: false, type: 'string' },
      { key: 'pollution_expiry', label: 'Pollution Expiry (YYYY-MM-DD)', required: false, type: 'string' },
      { key: 'gps_enabled', label: 'GPS Enabled', required: false, type: 'select', options: ['Yes', 'No'] },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Vehicle Number *': 'GJ05AB1234',
        'Vehicle Type': 'Trailer 40ft',
        'Vehicle Capacity (Tons)': 32.5,
        'Vehicle Owner': 'Own',
        'Vendor': '',
        'Registration Number': 'GJ05AB1234',
        'Registration Expiry (YYYY-MM-DD)': '2028-12-31',
        'Insurance Number': 'POL-99887766',
        'Insurance Expiry (YYYY-MM-DD)': '2027-06-30',
        'Fitness Expiry (YYYY-MM-DD)': '2026-11-15',
        'Pollution Expiry (YYYY-MM-DD)': '2026-10-01',
        'GPS Enabled': 'Yes',
        'Status': 'Active'
      }
    ]
  },
  warehouse: {
    title: 'Warehouse Master',
    filename: 'Warehouse_Master_Template.xlsx',
    uniqueKeys: ['warehouse_code'],
    headers: [
      { key: 'warehouse_code', label: 'Warehouse Code *', required: true, type: 'string' },
      { key: 'warehouse_name', label: 'Warehouse Name *', required: true, type: 'string' },
      { 
        key: 'warehouse_type', 
        label: 'Warehouse Type', 
        required: false, 
        type: 'select', 
        options: ['Bonded Warehouse', 'General / Non-Bonded', 'Cold Storage / Reefer', 'CFS / ICD Yard', 'Open Yard / Bulk', 'Hazardous Cargo', 'Buffer Yard'] 
      },
      { key: 'country_code', label: 'Country', required: false, type: 'string' },
      { key: 'state_code', label: 'State', required: false, type: 'string' },
      { key: 'city_name', label: 'City', required: false, type: 'string' },
      { key: 'address', label: 'Address', required: false, type: 'string' },
      { key: 'pincode', label: 'Pincode', required: false, type: 'string' },
      { key: 'contact_person', label: 'Contact Person', required: false, type: 'string' },
      { key: 'mobile', label: 'Mobile Number', required: false, type: 'string' },
      { key: 'email', label: 'Email', required: false, type: 'email' },
      { key: 'capacity', label: 'Capacity (SQFT / CBM)', required: false, type: 'number' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Warehouse Code *': 'WH-MUM-01',
        'Warehouse Name *': 'Nhava Sheva CFS Logistics Hub',
        'Warehouse Type': 'CFS / ICD Yard',
        'Country': 'India',
        'State': 'Maharashtra',
        'City': 'Navi Mumbai',
        'Address': 'Sector 10, Dronagiri Node, Uran',
        'Pincode': '400707',
        'Contact Person': 'Sunil Rane',
        'Mobile Number': '9820011223',
        'Email': 'sunil.rane@logistics.com',
        'Capacity (SQFT / CBM)': 50000,
        'Status': 'Active'
      }
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
      {
        'Package Type Code *': 'PLT',
        'Package Type Name *': 'Wooden Pallet',
        'Description': 'Standard Euro treated export pallet',
        'Status': 'Active'
      },
      {
        'Package Type Code *': 'CTN',
        'Package Type Name *': 'Corrugated Carton Box',
        'Description': 'Heavy duty 5-ply cardboard carton',
        'Status': 'Active'
      },
      {
        'Package Type Code *': 'DRM',
        'Package Type Name *': 'Steel / Plastic Drum',
        'Description': '200L liquid storage drum',
        'Status': 'Active'
      }
    ]
  },
  transportMode: {
    title: 'Transport Mode Master',
    filename: 'TransportMode_Master_Template.xlsx',
    uniqueKeys: ['mode_code'],
    headers: [
      { key: 'mode_code', label: 'Mode Code *', required: true, type: 'string' },
      { key: 'mode_name', label: 'Mode Name *', required: true, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Mode Code *': 'SEA',
        'Mode Name *': 'Sea Freight',
        'Description': 'Ocean containerized and bulk shipment',
        'Status': 'Active'
      },
      {
        'Mode Code *': 'AIR',
        'Mode Name *': 'Air Freight',
        'Description': 'Express air cargo transportation',
        'Status': 'Active'
      },
      {
        'Mode Code *': 'ROAD',
        'Mode Name *': 'Road Transport',
        'Description': 'Inland trucking and trailer fleet',
        'Status': 'Active'
      },
      {
        'Mode Code *': 'RAIL',
        'Mode Name *': 'Rail Freight',
        'Description': 'ICD container train rake movements',
        'Status': 'Active'
      }
    ]
  },
  employee: {
    title: 'Employee Master',
    filename: 'Employee_Master_Template.xlsx',
    uniqueKeys: ['employee_code'],
    headers: [
      { key: 'employee_code', label: 'Employee Code *', required: true, type: 'string' },
      { key: 'first_name', label: 'First Name *', required: true, type: 'string' },
      { key: 'middle_name', label: 'Middle Name', required: false, type: 'string' },
      { key: 'last_name', label: 'Last Name', required: false, type: 'string' },
      { key: 'gender', label: 'Gender', required: false, type: 'select', options: ['Male', 'Female', 'Other'] },
      { key: 'dob', label: 'Date of Birth (YYYY-MM-DD)', required: false, type: 'string' },
      { key: 'doj', label: 'Date of Joining (YYYY-MM-DD)', required: false, type: 'string' },
      { key: 'blood_group', label: 'Blood Group', required: false, type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      { key: 'department_code', label: 'Department *', required: true, type: 'string' },
      { key: 'designation_code', label: 'Designation *', required: true, type: 'string' },
      { key: 'employment_type', label: 'Employment Type', required: false, type: 'select', options: ['Full-Time', 'Part-Time', 'Contract', 'Intern'] },
      { key: 'reporting_manager', label: 'Reporting Manager', required: false, type: 'string' },
      { key: 'mobile', label: 'Mobile Number', required: false, type: 'string' },
      { key: 'alternate_mobile', label: 'Alternate Mobile', required: false, type: 'string' },
      { key: 'email', label: 'Email', required: false, type: 'email' },
      { key: 'address_line_1', label: 'Address Line 1', required: false, type: 'string' },
      { key: 'address_line_2', label: 'Address Line 2', required: false, type: 'string' },
      { key: 'country_code', label: 'Country', required: false, type: 'string' },
      { key: 'state_code', label: 'State', required: false, type: 'string' },
      { key: 'city_name', label: 'City', required: false, type: 'string' },
      { key: 'pincode', label: 'Pincode', required: false, type: 'string' },
      { key: 'aadhaar', label: 'Aadhaar Number', required: false, type: 'string' },
      { key: 'pan', label: 'PAN Number', required: false, type: 'string' },
      { key: 'passport', label: 'Passport Number', required: false, type: 'string' },
      { key: 'emergency_contact', label: 'Emergency Contact', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Inactive'] }
    ],
    sampleData: [
      {
        'Employee Code *': 'EMP-001',
        'First Name *': 'Amit',
        'Middle Name': 'Kumar',
        'Last Name': 'Sharma',
        'Gender': 'Male',
        'Date of Birth (YYYY-MM-DD)': '1990-08-15',
        'Date of Joining (YYYY-MM-DD)': '2023-01-10',
        'Blood Group': 'O+',
        'Department *': 'Logistics Operations',
        'Designation *': 'Operations Manager',
        'Employment Type': 'Full-Time',
        'Reporting Manager': '',
        'Mobile Number': '9876543210',
        'Alternate Mobile': '9876500000',
        'Email': 'amit.sharma@freightflow.com',
        'Address Line 1': 'A-404, Green Heights',
        'Address Line 2': 'Andheri East',
        'Country': 'India',
        'State': 'Maharashtra',
        'City': 'Mumbai',
        'Pincode': '400069',
        'Aadhaar Number': '123456789012',
        'PAN Number': 'ABCPS1234D',
        'Passport Number': 'N1234567',
        'Emergency Contact': '9876543211',
        'Status': 'Active'
      }
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
    wch: Math.max(h.label.length + 4, 16)
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
  return String(str).replace(/\*/g, '').replace(/[\(\)\[\]\/\-_]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
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
    if (compositeDbKey && compositeDbKey !== schema.uniqueKeys.map(() => '').join('::')) {
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
      if (rawRow[header.key] !== undefined && rawRow[header.key] !== null && rawRow[header.key] !== '') {
        rawVal = rawRow[header.key];
      } else {
        // Find matching key in rawRow ignoring casing/spaces/*
        const rawHeaderKey = Object.keys(rawRow).find(
          (rk) => {
            const normRk = normalizeHeader(rk);
            const normLabel = normalizeHeader(header.label);
            const normKey = normalizeHeader(header.key);
            return normRk === normLabel || normRk === normKey;
          }
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
        if (rawVal.toLowerCase() === 'true' || rawVal.toLowerCase() === 'yes' || rawVal.toLowerCase() === 'y' || rawVal === '1') rawVal = 'Yes';
        if (rawVal.toLowerCase() === 'false' || rawVal.toLowerCase() === 'no' || rawVal.toLowerCase() === 'n' || rawVal === '0') rawVal = 'No';
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
