/**
 * @file exportQuotation.model.js
 * @description Sequelize models for Export Quotation Header and Line Item Charges.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

/**
 * Export Quotation Header Model
 */
const ExportQuotation = sequelize.define("ExportQuotation", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  quotation_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  quotation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  inquiry_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  inquiry_no: {
    type: DataTypes.STRING,
    allowNull: true,
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
  commodity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hsn_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cargo_type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "General",
  },
  gross_weight: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  container_type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "20'",
  },
  no_of_containers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },
  shipment_terms: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "FOB",
  },
  cargo_ready_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  stuffing_location: {
    type: DataTypes.STRING,
    allowNull: true,
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
  special_requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Customs Verification Checklist
  customs_verification_status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Checked & Verified",
  },
  customs_commodity_checked: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Yes",
  },
  customs_cargo_photos: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Available",
  },
  customs_hsn_status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Verified",
  },
  customs_restrictions: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "None",
  },
  customs_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Carrier Options Evaluation (JSON Structured)
  carrier_option_a: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  carrier_option_b: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  carrier_option_c: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  selected_carrier: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  carrier_selection_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Totals & Status
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  priority: {
    type: DataTypes.ENUM("Low", "Medium", "High"),
    defaultValue: "Medium",
  },
  status: {
    type: DataTypes.ENUM("Draft", "Prepared", "Sent", "Accepted", "Rejected", "Cancelled"),
    defaultValue: "Prepared",
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
  tableName: "export_quotations",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

/**
 * Export Quotation Charge Line Item Model
 */
const ExportQuotationCharge = sequelize.define("ExportQuotationCharge", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quotation_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  charge_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  basis: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Per Container",
  },
  applicable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.00,
  },
  rate: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
}, {
  tableName: "export_quotation_charges",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = {
  ExportQuotation,
  ExportQuotationCharge,
};
