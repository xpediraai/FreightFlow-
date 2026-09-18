/**
 * @file exportQuotation.validators.js
 * @description Joi validation schemas for Export Quotation endpoints and line item charges.
 */
const Joi = require("joi");

const chargeItemSchema = Joi.object({
  id: Joi.string().allow("", null).optional(),
  name: Joi.string().allow("", null).optional(),
  charge_name: Joi.string().allow("", null).optional(),
  basis: Joi.string().allow("", null).optional().default("Per Container"),
  applicable: Joi.boolean().default(true),
  quantity: Joi.number().min(0).default(1),
  rate: Joi.number().min(0).default(0),
  amount: Joi.number().min(0).default(0),
}).unknown(true);

const carrierOptionSchema = Joi.object({
  line: Joi.string().allow("", null).optional(),
  freight: Joi.number().allow(null, 0).optional(),
  local: Joi.number().allow(null, 0).optional(),
  notes: Joi.string().allow("", null).optional(),
}).unknown(true);

const createExportQuotationSchema = Joi.object({
  quotation_no: Joi.string().allow("", null).optional(),
  quotation_date: Joi.date().iso().allow("", null).optional(),
  company_id: Joi.string().uuid().allow("", null).optional(),
  inquiry_id: Joi.string().uuid().allow("", null).optional(),
  inquiry_no: Joi.string().allow("", null).optional(),
  exporter_id: Joi.string().uuid().allow("", null).optional(),
  exporter_name: Joi.string().required(),
  pol: Joi.string().allow("", null).optional(),
  pod: Joi.string().allow("", null).optional(),
  fpod: Joi.string().allow("", null).optional(),
  commodity: Joi.string().allow("", null).optional(),
  hsn_code: Joi.string().allow("", null).optional(),
  cargo_type: Joi.string().allow("", null).optional().default("General"),
  gross_weight: Joi.string().allow("", null).optional(),
  container_type: Joi.string().allow("", null).optional().default("20'"),
  no_of_containers: Joi.number().integer().min(1).allow(null).optional().default(1),
  shipment_terms: Joi.string().allow("", null).optional().default("FOB"),
  cargo_ready_date: Joi.date().iso().allow("", null).optional(),
  stuffing_location: Joi.string().allow("", null).optional().default("Factory"),
  stuffing_location_other: Joi.string().allow("", null).optional(),
  factory_name: Joi.string().allow("", null).optional(),
  factory_address: Joi.string().allow("", null).optional(),
  factory_contact_person: Joi.string().allow("", null).optional(),
  shipping_line_preference: Joi.string().allow("", null).optional(),
  free_days_required: Joi.number().integer().min(0).allow(null).optional(),
  special_requirements: Joi.string().allow("", null).optional(),

  customs_verification_status: Joi.string().allow("", null).optional(),
  customs_commodity_checked: Joi.string().allow("", null).optional(),
  customs_cargo_photos: Joi.string().allow("", null).optional(),
  customs_hsn_status: Joi.string().allow("", null).optional(),
  customs_restrictions: Joi.string().allow("", null).optional(),
  customs_notes: Joi.string().allow("", null).optional(),

  carrier_option_a: carrierOptionSchema.optional(),
  carrier_option_b: carrierOptionSchema.optional(),
  carrier_option_c: carrierOptionSchema.optional(),
  selected_carrier: Joi.string().allow("", null).optional(),
  carrier_selection_notes: Joi.string().allow("", null).optional(),

  total_amount: Joi.number().min(0).optional().default(0),
  priority: Joi.string().valid("Low", "Medium", "High").default("Medium").optional(),
  status: Joi.string().valid("Draft", "Prepared", "Sent", "Accepted", "Rejected", "Cancelled").default("Prepared").optional(),

  charges: Joi.array().items(chargeItemSchema).optional().default([]),
}).unknown(true);

const updateExportQuotationSchema = Joi.object({
  quotation_no: Joi.string().optional(),
  quotation_date: Joi.date().iso().allow("", null).optional(),
  company_id: Joi.string().uuid().allow("", null).optional(),
  inquiry_id: Joi.string().uuid().allow("", null).optional(),
  inquiry_no: Joi.string().allow("", null).optional(),
  exporter_id: Joi.string().uuid().allow("", null).optional(),
  exporter_name: Joi.string().optional(),
  pol: Joi.string().allow("", null).optional(),
  pod: Joi.string().allow("", null).optional(),
  fpod: Joi.string().allow("", null).optional(),
  commodity: Joi.string().allow("", null).optional(),
  hsn_code: Joi.string().allow("", null).optional(),
  cargo_type: Joi.string().allow("", null).optional(),
  gross_weight: Joi.string().allow("", null).optional(),
  container_type: Joi.string().allow("", null).optional(),
  no_of_containers: Joi.number().integer().min(1).allow(null).optional(),
  shipment_terms: Joi.string().allow("", null).optional(),
  cargo_ready_date: Joi.date().iso().allow("", null).optional(),
  stuffing_location: Joi.string().allow("", null).optional(),
  stuffing_location_other: Joi.string().allow("", null).optional(),
  factory_name: Joi.string().allow("", null).optional(),
  factory_address: Joi.string().allow("", null).optional(),
  factory_contact_person: Joi.string().allow("", null).optional(),
  shipping_line_preference: Joi.string().allow("", null).optional(),
  free_days_required: Joi.number().integer().min(0).allow(null).optional(),
  special_requirements: Joi.string().allow("", null).optional(),

  customs_verification_status: Joi.string().allow("", null).optional(),
  customs_commodity_checked: Joi.string().allow("", null).optional(),
  customs_cargo_photos: Joi.string().allow("", null).optional(),
  customs_hsn_status: Joi.string().allow("", null).optional(),
  customs_restrictions: Joi.string().allow("", null).optional(),
  customs_notes: Joi.string().allow("", null).optional(),

  carrier_option_a: carrierOptionSchema.optional(),
  carrier_option_b: carrierOptionSchema.optional(),
  carrier_option_c: carrierOptionSchema.optional(),
  selected_carrier: Joi.string().allow("", null).optional(),
  carrier_selection_notes: Joi.string().allow("", null).optional(),

  total_amount: Joi.number().min(0).optional(),
  priority: Joi.string().valid("Low", "Medium", "High").optional(),
  status: Joi.string().valid("Draft", "Prepared", "Sent", "Accepted", "Rejected", "Cancelled").optional(),

  charges: Joi.array().items(chargeItemSchema).optional(),
}).min(1).unknown(true);

const statusChangeSchema = Joi.object({
  status: Joi.string().valid("Draft", "Prepared", "Sent", "Accepted", "Rejected", "Cancelled").required(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(100000).default(10).optional(),
  search: Joi.string().allow("", null).optional(),
  sortBy: Joi.string().default("created_at").optional(),
  sortOrder: Joi.string().valid("ASC", "DESC").default("DESC").optional(),
  status: Joi.string().allow("", null).optional(),
});

module.exports = {
  createExportQuotationSchema,
  updateExportQuotationSchema,
  statusChangeSchema,
  querySchema,
};
