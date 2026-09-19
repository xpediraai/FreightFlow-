const sequelize = require('../../config/database');
const { Op } = require('sequelize');

// Import Master Models
const Charge = require('./Common/ChargeMasters/charge.model');
const Country = require('./Foundation/CountryMasters/country.model');
const State = require('./Foundation/StateMasters/state.model');
const City = require('./Foundation/CityMasters/city.model');
const Currency = require('./Foundation/CurrencyMasters/currency.model');
const PaymentTerm = require('./Foundation/PaymentTermMasters/paymentTerm.model');
const Port = require('./Logistics/PortMasters/port.model');
const ShippingLine = require('./Logistics/ShippingLineMasters/shippingLine.model');
const ContainerType = require('./Common/ContainerTypeMasters/containerType.model');
const Department = require('./Organization/DepartmentMasters/department.model');
const Designation = require('./Organization/DesignationMasters/designation.model');
const Employee = require('./Organization/EmployeeMasters/employee.model');
const Commodity = require('./Common/CommodityMasters/commodity.model');
const Incoterm = require('./Common/IncotermMasters/incoterm.model');
const PackageType = require('./Common/PackageTypeMasters/packageType.model');
const TransportMode = require('./Common/TransportModeMasters/transportMode.model');
const UOM = require('./Common/UOMMasters/uom.model');
const Customer = require('./Business/CustomerMasters/Models/customer.model');
const Vendor = require('./Business/VendorMasters/Models/vendor.model');
const Vehicle = require('./Logistics/VehicleMasters/vehicle.model');
const Driver = require('./Logistics/DriverMasters/driver.model');
const Warehouse = require('./Logistics/WarehouseMasters/warehouse.model');

// Model Map for Dynamic Resolution
const MODEL_MAP = {
  charge: { model: Charge, uniqueKeys: ['charge_code'] },
  country: { model: Country, uniqueKeys: ['country_code'] },
  state: { model: State, uniqueKeys: ['country_id', 'state_code'] },
  city: { model: City, uniqueKeys: ['state_id', 'city_code'] },
  currency: { model: Currency, uniqueKeys: ['currency_code'] },
  paymentTerm: { model: PaymentTerm, uniqueKeys: ['payment_term_code'] },
  port: { model: Port, uniqueKeys: ['port_code'] },
  shippingLine: { model: ShippingLine, uniqueKeys: ['shipping_line_code'] },
  containerType: { model: ContainerType, uniqueKeys: ['container_code'] },
  department: { model: Department, uniqueKeys: ['department_code'] },
  designation: { model: Designation, uniqueKeys: ['designation_code'] },
  employee: { model: Employee, uniqueKeys: ['employee_code'] },
  commodity: { model: Commodity, uniqueKeys: ['commodity_code'] },
  incoterm: { model: Incoterm, uniqueKeys: ['incoterm_code'] },
  packageType: { model: PackageType, uniqueKeys: ['package_type_code'] },
  transportMode: { model: TransportMode, uniqueKeys: ['mode_code'] },
  uom: { model: UOM, uniqueKeys: ['uom_code'] },
  customer: { model: Customer, uniqueKeys: ['customer_code'] },
  vendor: { model: Vendor, uniqueKeys: ['vendor_code'] },
  vehicle: { model: Vehicle, uniqueKeys: ['vehicle_number'] },
  driver: { model: Driver, uniqueKeys: ['license_number'] },
  warehouse: { model: Warehouse, uniqueKeys: ['warehouse_code'] }
};

/**
 * Generates smart 3-letter country code from country name
 */
const generateSmartCountryCode = (name) => {
  if (!name) return 'CNT';
  const words = name.trim().split(/\s+/);
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  }
  return name.substring(0, 3).toUpperCase();
};

/**
 * Normalize vendor type to match Vendor model ENUM
 */
const normalizeVendorType = (val) => {
  if (!val) return 'Other';
  const str = String(val).toLowerCase();
  if (str.includes('shipping')) return 'Shipping Line';
  if (str.includes('transporter') || str.includes('fleet')) return 'Transporter';
  if (str.includes('cha') || str.includes('customs')) return 'CHA';
  if (str.includes('cfs') || str.includes('icd')) return 'CFS';
  if (str.includes('warehouse')) return 'Warehouse';
  if (str.includes('surveyor') || str.includes('inspection')) return 'Surveyor';
  return 'Other';
};

/**
 * Service to execute bulk import transactional operations with automatic foreign key resolution & upserting
 */
const executeBulkImport = async (entityType, rows, user) => {
  const config = MODEL_MAP[entityType];
  if (!config) {
    throw new Error(`Unsupported entity type for bulk import: ${entityType}`);
  }

  const { model: Model, uniqueKeys } = config;

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('No rows provided for bulk import.');
  }

  const companyId = user?.company_id || user?.companyId;
  const userId = user?.id;

  if (!companyId) {
    throw new Error('Company context is required for bulk import.');
  }

  const transaction = await sequelize.transaction();
  let createdCount = 0;
  let updatedCount = 0;

  // In-memory resolution caches to prevent duplicate DB lookups within transaction
  const countryCache = new Map();
  const stateCache = new Map();
  const cityCache = new Map();
  const departmentCache = new Map();
  const designationCache = new Map();
  const vendorCache = new Map();
  const currencyCache = new Map();

  try {
    for (const row of rows) {
      const { data } = row;
      if (!data) continue;

      const recordData = {
        ...data,
        company_id: companyId,
        updated_by: userId
      };

      // ----------------------------------------------------
      // A. Foreign Key: Country Resolution & Auto-Creation
      // ----------------------------------------------------
      if (entityType !== 'country') {
        const countryVal = data.country_code || data.country_id || data.country;
        if (countryVal) {
          const strCountry = String(countryVal).trim();
          const countryCacheKey = strCountry.toLowerCase();
          let countryObj = countryCache.get(countryCacheKey);

          if (!countryObj) {
            countryObj = await Country.findOne({
              where: {
                company_id: companyId,
                [Op.or]: [
                  { country_code: { [Op.iLike]: strCountry } },
                  { country_name: { [Op.iLike]: strCountry } }
                ]
              },
              transaction
            });
          }

          if (!countryObj && (entityType === 'state' || entityType === 'city' || entityType === 'port' || entityType === 'shippingLine' || entityType === 'driver' || entityType === 'warehouse' || entityType === 'employee' || entityType === 'vendor')) {
            let code = generateSmartCountryCode(strCountry);
            let attempts = 0;
            while (await Country.findOne({ where: { company_id: companyId, country_code: code }, transaction })) {
              attempts++;
              code = `${strCountry.substring(0, 2).toUpperCase()}${attempts}`;
            }

            countryObj = await Country.create({
              company_id: companyId,
              country_code: code,
              country_name: strCountry,
              status: 'Active',
              created_by: userId,
              updated_by: userId
            }, { transaction });
          }

          if (countryObj) {
            countryCache.set(countryCacheKey, countryObj);
            recordData.country_id = countryObj.id;
          }
        }
        delete recordData.country_code;
        delete recordData.country;
      }

      // ----------------------------------------------------
      // B. Foreign Key: State Resolution & Auto-Creation
      // ----------------------------------------------------
      if (entityType !== 'state') {
        const stateVal = data.state_code || data.state_id || data.state;
        if (stateVal) {
          const strState = String(stateVal).trim();
          const stateCacheKey = `${recordData.country_id || 'ANY'}::${strState.toLowerCase()}`;
          let stateObj = stateCache.get(stateCacheKey);

          if (!stateObj) {
            const stateWhere = {
              company_id: companyId,
              [Op.or]: [
                { state_code: { [Op.iLike]: strState } },
                { state_name: { [Op.iLike]: strState } }
              ]
            };
            if (recordData.country_id) {
              stateWhere.country_id = recordData.country_id;
            }

            stateObj = await State.findOne({ where: stateWhere, transaction });
          }

          if (!stateObj && recordData.country_id) {
            let code = strState.substring(0, 3).toUpperCase();
            let attempts = 0;
            while (await State.findOne({ where: { company_id: companyId, country_id: recordData.country_id, state_code: code }, transaction })) {
              attempts++;
              code = `${strState.substring(0, 2).toUpperCase()}${attempts}`;
            }

            stateObj = await State.create({
              company_id: companyId,
              country_id: recordData.country_id,
              state_code: code,
              state_name: strState,
              status: 'Active',
              created_by: userId,
              updated_by: userId
            }, { transaction });
          }

          if (stateObj) {
            stateCache.set(stateCacheKey, stateObj);
            recordData.state_id = stateObj.id;
          }
        }
        delete recordData.state_code;
        delete recordData.state;
      }

      // ----------------------------------------------------
      // C. Foreign Key: City Resolution & Auto-Creation
      // ----------------------------------------------------
      if (entityType !== 'city') {
        const cityVal = data.city_name || data.city_code || data.city_id || data.city;
        if (cityVal) {
          const strCity = String(cityVal).trim();
          const cityCacheKey = `${recordData.state_id || 'ANY'}::${strCity.toLowerCase()}`;
          let cityObj = cityCache.get(cityCacheKey);

          if (!cityObj) {
            const cityWhere = {
              company_id: companyId,
              [Op.or]: [
                { city_name: { [Op.iLike]: strCity } },
                { city_code: { [Op.iLike]: strCity } }
              ]
            };
            if (recordData.state_id) {
              cityWhere.state_id = recordData.state_id;
            }

            cityObj = await City.findOne({ where: cityWhere, transaction });
          }

          if (!cityObj && recordData.state_id && recordData.country_id) {
            let code = strCity.substring(0, 3).toUpperCase();
            let attempts = 0;
            while (await City.findOne({ where: { company_id: companyId, state_id: recordData.state_id, city_code: code }, transaction })) {
              attempts++;
              code = `${strCity.substring(0, 2).toUpperCase()}${attempts}`;
            }

            cityObj = await City.create({
              company_id: companyId,
              country_id: recordData.country_id,
              state_id: recordData.state_id,
              city_code: code,
              city_name: strCity,
              status: 'Active',
              created_by: userId,
              updated_by: userId
            }, { transaction });
          }

          if (cityObj) {
            cityCache.set(cityCacheKey, cityObj);
            recordData.city_id = cityObj.id;
          }
        }
        delete recordData.city_name;
        delete recordData.city;
      }

      // ----------------------------------------------------
      // D. Foreign Key: Department Resolution & Auto-Creation
      // ----------------------------------------------------
      if (entityType !== 'department') {
        const deptVal = data.department_code || data.department_name || data.department_id || data.department;
        if (deptVal) {
          const strDept = String(deptVal).trim();
          const deptCacheKey = strDept.toLowerCase();
          let deptObj = departmentCache.get(deptCacheKey);

          if (!deptObj) {
            deptObj = await Department.findOne({
              where: {
                company_id: companyId,
                [Op.or]: [
                  { department_code: { [Op.iLike]: strDept } },
                  { department_name: { [Op.iLike]: strDept } }
                ]
              },
              transaction
            });
          }

          if (!deptObj && (entityType === 'designation' || entityType === 'employee')) {
            let code = strDept.substring(0, 4).toUpperCase();
            let attempts = 0;
            while (await Department.findOne({ where: { company_id: companyId, department_code: code }, transaction })) {
              attempts++;
              code = `${strDept.substring(0, 3).toUpperCase()}${attempts}`;
            }

            deptObj = await Department.create({
              company_id: companyId,
              department_code: code,
              department_name: strDept,
              status: 'Active',
              created_by: userId,
              updated_by: userId
            }, { transaction });
          }

          if (deptObj) {
            departmentCache.set(deptCacheKey, deptObj);
            recordData.department_id = deptObj.id;
          }
        }
        delete recordData.department_code;
        delete recordData.department_name;
        delete recordData.department;
      }

      // ----------------------------------------------------
      // E. Foreign Key: Designation Resolution & Auto-Creation
      // ----------------------------------------------------
      if (entityType !== 'designation') {
        const desigVal = data.designation_code || data.designation_name || data.designation_id || data.designation;
        if (desigVal) {
          const strDesig = String(desigVal).trim();
          const desigCacheKey = strDesig.toLowerCase();
          let desigObj = designationCache.get(desigCacheKey);

          if (!desigObj) {
            desigObj = await Designation.findOne({
              where: {
                company_id: companyId,
                [Op.or]: [
                  { designation_code: { [Op.iLike]: strDesig } },
                  { designation_name: { [Op.iLike]: strDesig } }
                ]
              },
              transaction
            });
          }

          if (!desigObj && entityType === 'employee') {
            let code = strDesig.substring(0, 4).toUpperCase();
            let attempts = 0;
            while (await Designation.findOne({ where: { company_id: companyId, designation_code: code }, transaction })) {
              attempts++;
              code = `${strDesig.substring(0, 3).toUpperCase()}${attempts}`;
            }

            desigObj = await Designation.create({
              company_id: companyId,
              department_id: recordData.department_id || null,
              designation_code: code,
              designation_name: strDesig,
              status: 'Active',
              created_by: userId,
              updated_by: userId
            }, { transaction });
          }

          if (desigObj) {
            designationCache.set(desigCacheKey, desigObj);
            recordData.designation_id = desigObj.id;
          }
        }
        delete recordData.designation_code;
        delete recordData.designation_name;
        delete recordData.designation;
      }

      // ----------------------------------------------------
      // F. Foreign Key: Vendor Resolution
      // ----------------------------------------------------
      if (entityType !== 'vendor') {
        const vendorVal = data.vendor_code || data.vendor_name || data.vendor_id || data.vendor;
        if (vendorVal && (entityType === 'vehicle' || entityType === 'driver')) {
          const strVendor = String(vendorVal).trim();
          const vendorCacheKey = strVendor.toLowerCase();
          let vendorObj = vendorCache.get(vendorCacheKey);

          if (!vendorObj) {
            vendorObj = await Vendor.findOne({
              where: {
                company_id: companyId,
                [Op.or]: [
                  { vendor_code: { [Op.iLike]: strVendor } },
                  { vendor_name: { [Op.iLike]: strVendor } }
                ]
              },
              transaction
            });
          }

          if (vendorObj) {
            vendorCache.set(vendorCacheKey, vendorObj);
            recordData.vendor_id = vendorObj.id;
          }
        }
        delete recordData.vendor_code;
        delete recordData.vendor;
      }

      // ----------------------------------------------------
      // G. Foreign Key: Currency Resolution
      // ----------------------------------------------------
      if (entityType !== 'currency') {
        const currVal = data.currency_code || data.currency_name || data.currency_id || data.currency || data.default_currency;
        if (currVal && (entityType === 'customer' || entityType === 'vendor' || entityType === 'charge')) {
          const strCurr = String(currVal).trim();
          const currCacheKey = strCurr.toLowerCase();
          let currObj = currencyCache.get(currCacheKey);

          if (!currObj) {
            currObj = await Currency.findOne({
              where: {
                company_id: companyId,
                [Op.or]: [
                  { currency_code: { [Op.iLike]: strCurr } },
                  { currency_name: { [Op.iLike]: strCurr } },
                  { symbol: { [Op.iLike]: strCurr } }
                ]
              },
              transaction
            });
          }

          if (currObj) {
            currencyCache.set(currCacheKey, currObj);
            if (entityType === 'charge') {
              recordData.default_currency = currObj.id;
            } else {
              recordData.currency_id = currObj.id;
            }
          }
        }
        delete recordData.currency_code;
        delete recordData.currency;
      }

      // ----------------------------------------------------
      // H. Entity-Specific Field Formatting & Defaults
      // ----------------------------------------------------
      if (entityType === 'charge') {
        const rawSubType = recordData.shipment_sub_type || recordData.charge_type || recordData['Shipment Sub Type'];
        if (rawSubType) {
          if (Array.isArray(rawSubType)) {
            recordData.shipment_sub_type = rawSubType;
            recordData.charge_type = rawSubType.join(', ');
          } else if (typeof rawSubType === 'string' && rawSubType.trim()) {
            const arr = rawSubType.split(',').map(s => s.trim()).filter(Boolean);
            recordData.shipment_sub_type = arr;
            recordData.charge_type = arr.join(', ');
          }
        } else {
          recordData.shipment_sub_type = [];
          recordData.charge_type = '';
        }
        if (!recordData.applicable_module) recordData.applicable_module = 'Quotation';
        if (recordData.basis === undefined || recordData.basis === '') recordData.basis = 'Per Container';
        recordData.default_rate = recordData.default_rate !== '' && !isNaN(Number(recordData.default_rate)) ? Number(recordData.default_rate) : 0;
        recordData.default_qty = recordData.default_qty !== '' && !isNaN(Number(recordData.default_qty)) ? parseInt(recordData.default_qty, 10) : 1;
        recordData.default_applicable = recordData.default_applicable === 'Yes' || recordData.default_applicable === true || recordData.default_applicable === 'true';
        recordData.tax_applicable = recordData.tax_applicable === 'Yes' || recordData.tax_applicable === true || recordData.tax_applicable === 'true';
      }

      if (entityType === 'containerType') {
        if (!recordData.iso_code) recordData.iso_code = recordData.container_code || 'GEN';
        if (!recordData.size) recordData.size = '20';
        if (!recordData.category) recordData.category = 'Dry';
        recordData.capacity_cbm = recordData.capacity_cbm !== '' && !isNaN(Number(recordData.capacity_cbm)) ? Number(recordData.capacity_cbm) : null;
        recordData.max_weight = recordData.max_weight !== '' && !isNaN(Number(recordData.max_weight)) ? Number(recordData.max_weight) : null;
      }

      if (entityType === 'customer') {
        if (!recordData.customer_type) recordData.customer_type = 'Shipper / Exporter';
        recordData.credit_limit = recordData.credit_limit !== '' && !isNaN(Number(recordData.credit_limit)) ? Number(recordData.credit_limit) : null;
      }

      if (entityType === 'vendor') {
        recordData.vendor_type = normalizeVendorType(recordData.vendor_type);
      }

      if (entityType === 'currency') {
        recordData.exchange_rate = recordData.exchange_rate !== '' && !isNaN(Number(recordData.exchange_rate)) ? Number(recordData.exchange_rate) : 1;
        recordData.base_currency = recordData.base_currency === 'Yes' ? 'Yes' : 'No';
      }

      if (entityType === 'paymentTerm') {
        recordData.credit_days = recordData.credit_days !== '' && !isNaN(Number(recordData.credit_days)) ? parseInt(recordData.credit_days, 10) : 0;
      }

      if (entityType === 'shippingLine') {
        if (!recordData.tracking_method) recordData.tracking_method = 'GENERIC_FETCH';
      }

      if (entityType === 'commodity') {
        recordData.hazardous = recordData.hazardous === 'Yes' ? 'Yes' : 'No';
      }

      if (entityType === 'vehicle') {
        recordData.vehicle_capacity = recordData.vehicle_capacity !== '' && !isNaN(Number(recordData.vehicle_capacity)) ? Number(recordData.vehicle_capacity) : null;
        recordData.gps_enabled = recordData.gps_enabled === 'Yes' ? 'Yes' : 'No';
        
        // Nullify empty date fields
        ['registration_expiry', 'insurance_expiry', 'fitness_expiry', 'pollution_expiry'].forEach(f => {
          if (!recordData[f] || recordData[f] === '') recordData[f] = null;
        });
      }

      if (entityType === 'driver') {
        if (!recordData.license_expiry || recordData.license_expiry === '') recordData.license_expiry = null;
      }

      if (entityType === 'warehouse') {
        recordData.capacity = recordData.capacity !== '' && !isNaN(Number(recordData.capacity)) ? Number(recordData.capacity) : null;
      }

      if (entityType === 'employee') {
        if (!recordData.dob || recordData.dob === '') recordData.dob = null;
        if (!recordData.doj || recordData.doj === '') recordData.doj = null;
        if (recordData.reporting_manager && typeof recordData.reporting_manager === 'string') {
          // If reporting manager is not a UUID, try finding employee
          const mgr = await Employee.findOne({
            where: {
              company_id: companyId,
              [Op.or]: [
                { employee_code: { [Op.iLike]: recordData.reporting_manager.trim() } },
                { first_name: { [Op.iLike]: recordData.reporting_manager.trim() } }
              ]
            },
            transaction
          });
          if (mgr) {
            recordData.reporting_manager = mgr.id;
          } else {
            recordData.reporting_manager = null;
          }
        }
      }

      // Default status
      if (!recordData.status) recordData.status = 'Active';

      // Clean up auxiliary fields that aren't model columns
      delete recordData._row;
      delete recordData._errors;
      delete recordData._status;

      // ----------------------------------------------------
      // I. Perform Atomic Upsert Check (Find existing record)
      // ----------------------------------------------------
      const whereClause = { company_id: companyId };
      let hasAllKeys = true;

      for (const k of uniqueKeys) {
        if (recordData[k] !== undefined && recordData[k] !== null && String(recordData[k]).trim() !== '') {
          whereClause[k] = recordData[k];
        } else {
          hasAllKeys = false;
        }
      }

      let existingRecord = null;
      if (hasAllKeys) {
        existingRecord = await Model.findOne({ where: whereClause, transaction });
      }

      if (existingRecord) {
        // Atomic Update
        await existingRecord.update(recordData, { transaction });
        updatedCount++;
      } else {
        // Atomic Create
        recordData.created_by = userId;
        await Model.create(recordData, { transaction });
        createdCount++;
      }
    }

    // Commit Transaction
    await transaction.commit();

    return {
      totalProcessed: createdCount + updatedCount,
      createdCount,
      updatedCount
    };
  } catch (error) {
    // Rollback Transaction on error
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  executeBulkImport
};
