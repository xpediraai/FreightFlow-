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

  // In-memory resolution caches to prevent duplicate DB calls and race conditions within the transaction
  const countryCache = new Map();
  const stateCache = new Map();

  try {
    for (const row of rows) {
      const { data } = row;
      if (!data) continue;

      const recordData = {
        ...data,
        company_id: companyId,
        updated_by: userId
      };

      // 1. Resolve & Auto-Create Foreign Keys (Country, State, City)
      if (entityType === 'state' || entityType === 'city' || entityType === 'port') {
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

          if (!countryObj) {
            // Auto-create missing Country with unique code guarantee
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

          countryCache.set(countryCacheKey, countryObj);
          recordData.country_id = countryObj.id;
          delete recordData.country_code;
          delete recordData.country;
        }

        if ((entityType === 'city' || entityType === 'port') && recordData.country_id) {
          const stateVal = data.state_code || data.state_id || data.state;
          if (stateVal) {
            const strState = String(stateVal).trim();
            const stateCacheKey = `${recordData.country_id}::${strState.toLowerCase()}`;
            
            let stateObj = stateCache.get(stateCacheKey);

            if (!stateObj) {
              stateObj = await State.findOne({
                where: {
                  company_id: companyId,
                  country_id: recordData.country_id,
                  [Op.or]: [
                    { state_code: { [Op.iLike]: strState } },
                    { state_name: { [Op.iLike]: strState } }
                  ]
                },
                transaction
              });
            }

            if (!stateObj) {
              // Auto-create missing State with unique code guarantee
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

            stateCache.set(stateCacheKey, stateObj);
            recordData.state_id = stateObj.id;
            delete recordData.state_code;
            delete recordData.state;
          }
        }

        if (entityType === 'port') {
          delete recordData.city_name;
          delete recordData.city;
        }
      }

      // Clean up auxiliary fields that aren't model columns
      delete recordData._row;
      delete recordData._errors;
      delete recordData._status;

      // 2. Perform Atomic Upsert Check (Find existing record by composite key)
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
