/**
 * @file index.js
 * @description Central database entry point. Consolidates the Sequelize client instance,
 * loads models, and registers database relationships/associations.
 * @module database/index
 * @requires config/database
 */

const sequelize = require("../config/database");

// Registry object to hold Sequelize, Sequelize constructors, and model definitions
const db = {};

// Attach the configured Sequelize client instance
db.sequelize = sequelize;

// Import Models
db.Users = require("../modules/Auth/Users/users.model");
db.RefreshTokens = require("../modules/Auth/RefreshTokens/refresh_tokens.model");
db.Company = require("../modules/Masters/CompanyMasters/company.model");
db.UserCompanies = require("../modules/Masters/CompanyMasters/user_companies.model");

// Master Models
db.Country = require("../modules/Masters/CountryMasters/country.model");
db.State = require("../modules/Masters/StateMasters/state.model");
db.City = require("../modules/Masters/CityMasters/city.model");
db.Currency = require("../modules/Masters/CurrencyMasters/currency.model");
db.Port = require("../modules/Masters/PortMasters/port.model");
db.ShippingLine = require("../modules/Masters/ShippingLineMasters/shippingLine.model");
db.ContainerType = require("../modules/Masters/ContainerTypeMasters/containerType.model");
db.TransportMode = require("../modules/Masters/TransportModeMasters/transportMode.model");
db.Commodity = require("../modules/Masters/CommodityMasters/commodity.model");
db.Customer = require("../modules/Masters/CustomerMasters/Models/customer.model");
db.CustomerContact = require("../modules/Masters/CustomerMasters/Models/customerContact.model");
db.CustomerAddress = require("../modules/Masters/CustomerMasters/Models/customerAddress.model");
db.CustomerBank = require("../modules/Masters/CustomerMasters/Models/customerBank.model");
db.CustomerDocument = require("../modules/Masters/CustomerMasters/Models/customerDocument.model");
db.Vendor = require("../modules/Masters/VendorMasters/Models/vendor.model");
db.VendorContact = require("../modules/Masters/VendorMasters/Models/vendorContact.model");
db.VendorAddress = require("../modules/Masters/VendorMasters/Models/vendorAddress.model");
db.VendorBank = require("../modules/Masters/VendorMasters/Models/vendorBank.model");

// Define Associations
db.Users.hasMany(db.RefreshTokens, { foreignKey: "user_id" });
db.RefreshTokens.belongsTo(db.Users, { foreignKey: "user_id" });

db.Users.belongsToMany(db.Company, { through: db.UserCompanies, foreignKey: "user_id" });
db.Company.belongsToMany(db.Users, { through: db.UserCompanies, foreignKey: "company_id" });

// Master Associations
db.State.belongsTo(db.Country, { foreignKey: 'country_id', as: 'country' });
db.Country.hasMany(db.State, { foreignKey: 'country_id', as: 'states' });

db.City.belongsTo(db.Country, { foreignKey: 'country_id', as: 'country' });
db.Country.hasMany(db.City, { foreignKey: 'country_id', as: 'cities' });

db.City.belongsTo(db.State, { foreignKey: 'state_id', as: 'state' });
db.State.hasMany(db.City, { foreignKey: 'state_id', as: 'cities' });

db.Port.belongsTo(db.Country, { foreignKey: 'country_id', as: 'country' });
db.Country.hasMany(db.Port, { foreignKey: 'country_id', as: 'ports' });

db.Port.belongsTo(db.State, { foreignKey: 'state_id', as: 'state' });
db.State.hasMany(db.Port, { foreignKey: 'state_id', as: 'ports' });

db.Port.belongsTo(db.City, { foreignKey: 'city_id', as: 'city' });
db.City.hasMany(db.Port, { foreignKey: 'city_id', as: 'ports' });

db.ShippingLine.belongsTo(db.Country, { foreignKey: 'country_id', as: 'country' });
db.Country.hasMany(db.ShippingLine, { foreignKey: 'country_id', as: 'shipping_lines' });

// Customer Associations
db.Customer.hasMany(db.CustomerContact, { as: 'contacts', foreignKey: 'customer_id' });
db.CustomerContact.belongsTo(db.Customer, { foreignKey: 'customer_id' });

db.Customer.hasMany(db.CustomerAddress, { as: 'addresses', foreignKey: 'customer_id' });
db.CustomerAddress.belongsTo(db.Customer, { foreignKey: 'customer_id' });

db.Customer.hasMany(db.CustomerBank, { as: 'banks', foreignKey: 'customer_id' });
db.CustomerBank.belongsTo(db.Customer, { foreignKey: 'customer_id' });

db.Customer.hasMany(db.CustomerDocument, { as: 'documents', foreignKey: 'customer_id' });
db.CustomerDocument.belongsTo(db.Customer, { foreignKey: 'customer_id' });

// Vendor Associations
db.Vendor.hasMany(db.VendorContact, { as: 'contacts', foreignKey: 'vendor_id' });
db.VendorContact.belongsTo(db.Vendor, { foreignKey: 'vendor_id' });

db.Vendor.hasMany(db.VendorAddress, { as: 'addresses', foreignKey: 'vendor_id' });
db.VendorAddress.belongsTo(db.Vendor, { foreignKey: 'vendor_id' });

db.Vendor.hasMany(db.VendorBank, { as: 'banks', foreignKey: 'vendor_id' });
db.VendorBank.belongsTo(db.Vendor, { foreignKey: 'vendor_id' });

module.exports = db;