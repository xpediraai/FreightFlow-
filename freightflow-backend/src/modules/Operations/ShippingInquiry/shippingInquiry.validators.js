/**
 * @file shippingInquiry.validators.js
 * @description Joi validation schemas for Export Shipping Inquiry and nested items.
 */
const Joi = require("joi");

const cargoItemSchema = Joi.object({
  id: Joi.string().uuid().allow("", null).optional(),
  commodity: Joi.string().required(),
  hsn_code: Joi.string().required(),
  cargo_type: Joi.string().allow("", null).optional().default("General"),
  weight_value: Joi.string().allow("", null).optional(),
  weight_uom: Joi.string().allow("", null).optional().default("KG"),
}).unknown(true);

const containerItemSchema = Joi.object({
  id: Joi.string().uuid().allow("", null).optional(),
  container_type: Joi.string().required(),
  no_of_containers: Joi.number().integer().min(1).required(),
}).unknown(true);

const createShippingInquirySchema = Joi.object({
  inquiry_no: Joi.string().allow("", null).optional(),
  company_id: Joi.string().uuid().allow("", null).optional(),
  exporter_id: Joi.string().uuid().allow("", null).optional(),
  exporter_name: Joi.string().required(),
  pol: Joi.string().allow("", null).optional(),
  pod: Joi.string().allow("", null).optional(),
  fpod: Joi.string().allow("", null).optional(),
  shipment_type: Joi.string().allow("", null).optional(),
  shipment_sub_type: Joi.string().allow("", null).optional(),
  shipment_terms: Joi.string().allow("", null).optional().default("FOB"),
  cargo_ready_date: Joi.date().iso().allow("", null).optional(),
  stuffing_location: Joi.string().allow("", null).optional().default("Factory"),
  stuffing_location_other: Joi.string().allow("", null).optional(),
  factory_name: Joi.string().allow("", null).optional(),
  factory_address: Joi.string().allow("", null).optional(),
  factory_contact_person: Joi.string().allow("", null).optional(),
  shipping_line_preference: Joi.string().allow("", null).optional(),
  free_days_required: Joi.number().integer().min(0).allow(null).optional(),
  inspections: Joi.string().allow("", null).optional(),
  certifications: Joi.string().allow("", null).optional(),
  fumigations: Joi.string().allow("", null).optional(),
  loading_unloading: Joi.string().allow("", null).optional(),
  palletization: Joi.string().allow("", null).optional(),
  lashing_chocking: Joi.string().allow("", null).optional(),
  special_requirements: Joi.string().allow("", null).optional(),
  priority: Joi.string().valid("Low", "Medium", "High").default("Medium").optional(),
  status: Joi.string().valid("Pending", "Quoted", "Confirmed", "In Progress", "Cancelled").default("Pending").optional(),

  cargoDetails: Joi.array().items(cargoItemSchema).optional().default([]),
  containerDetails: Joi.array().items(containerItemSchema).optional().default([]),
}).unknown(true);

const updateShippingInquirySchema = Joi.object({
  inquiry_no: Joi.string().optional(),
  company_id: Joi.string().uuid().allow("", null).optional(),
  exporter_id: Joi.string().uuid().allow("", null).optional(),
  exporter_name: Joi.string().optional(),
  pol: Joi.string().allow("", null).optional(),
  pod: Joi.string().allow("", null).optional(),
  fpod: Joi.string().allow("", null).optional(),
  shipment_type: Joi.string().allow("", null).optional(),
  shipment_sub_type: Joi.string().allow("", null).optional(),
  shipment_terms: Joi.string().allow("", null).optional(),
  cargo_ready_date: Joi.date().iso().allow("", null).optional(),
  stuffing_location: Joi.string().allow("", null).optional(),
  stuffing_location_other: Joi.string().allow("", null).optional(),
  factory_name: Joi.string().allow("", null).optional(),
  factory_address: Joi.string().allow("", null).optional(),
  factory_contact_person: Joi.string().allow("", null).optional(),
  shipping_line_preference: Joi.string().allow("", null).optional(),
  free_days_required: Joi.number().integer().min(0).allow(null).optional(),
  inspections: Joi.string().allow("", null).optional(),
  certifications: Joi.string().allow("", null).optional(),
  fumigations: Joi.string().allow("", null).optional(),
  loading_unloading: Joi.string().allow("", null).optional(),
  palletization: Joi.string().allow("", null).optional(),
  lashing_chocking: Joi.string().allow("", null).optional(),
  special_requirements: Joi.string().allow("", null).optional(),
  priority: Joi.string().valid("Low", "Medium", "High").optional(),
  status: Joi.string().valid("Pending", "Quoted", "Confirmed", "In Progress", "Cancelled").optional(),

  cargoDetails: Joi.array().items(cargoItemSchema).optional(),
  containerDetails: Joi.array().items(containerItemSchema).optional(),
}).min(1).unknown(true);

const statusChangeSchema = Joi.object({
  status: Joi.string().valid("Pending", "Quoted", "Confirmed", "In Progress", "Cancelled").required(),
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
  createShippingInquirySchema,
  updateShippingInquirySchema,
  statusChangeSchema,
  querySchema,
};
