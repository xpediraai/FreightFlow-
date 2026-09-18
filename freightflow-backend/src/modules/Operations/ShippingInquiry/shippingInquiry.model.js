/**
 * @file shippingInquiry.model.js
 * @description Sequelize models for Export Shipping Inquiry, Cargo Details, and Container Requirements.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

/**
 * Shipping Inquiry Header Model
 */
const ShippingInquiry = sequelize.define("ShippingInquiry", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  inquiry_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  exporter_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  exporter_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pol: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fpod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shipment_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shipment_sub_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shipment_terms: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "FOB",
  },
  cargo_ready_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  stuffing_location: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Factory",
  },
  stuffing_location_other: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  factory_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  factory_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  factory_contact_person: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shipping_line_preference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  free_days_required: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  inspections: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  certifications: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fumigations: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  loading_unloading: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  palletization: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lashing_chocking: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  special_requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM("Low", "Medium", "High"),
    defaultValue: "Medium",
  },
  status: {
    type: DataTypes.ENUM("Pending", "Quoted", "Confirmed", "In Progress", "Cancelled"),
    defaultValue: "Pending",
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: "shipping_inquiries",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

/**
 * Shipping Inquiry Cargo Detail Model
 */
const ShippingInquiryCargo = sequelize.define("ShippingInquiryCargo", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  inquiry_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  commodity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hsn_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cargo_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "General",
  },
  weight_value: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  weight_uom: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "KG",
  },
}, {
  tableName: "shipping_inquiry_cargos",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

/**
 * Shipping Inquiry Container Line Model
 */
const ShippingInquiryContainer = sequelize.define("ShippingInquiryContainer", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  inquiry_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  container_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "20'",
  },
  no_of_containers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: "shipping_inquiry_containers",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = {
  ShippingInquiry,
  ShippingInquiryCargo,
  ShippingInquiryContainer,
};
