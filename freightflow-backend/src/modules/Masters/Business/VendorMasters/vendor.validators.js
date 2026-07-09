/**
 * @file vendor.validators.js
 * @description Joi validation schemas for Vendor Master.
 */
const Joi = require("joi");

const contactSchema = Joi.object({
    id: Joi.string().uuid().optional(),
    name: Joi.string().required(),
    designation: Joi.string().allow("", null).optional(),
    mobile: Joi.string().allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional(),
    is_primary: Joi.boolean().default(false)
});

const addressSchema = Joi.object({
    id: Joi.string().uuid().optional(),
    address_type: Joi.string().allow("", null).optional(),
    country_id: Joi.string().uuid().allow(null).optional(),
    state_id: Joi.string().uuid().allow(null).optional(),
    city_id: Joi.string().uuid().allow(null).optional(),
    address_line_1: Joi.string().allow("", null).optional(),
    address_line_2: Joi.string().allow("", null).optional(),
    pincode: Joi.string().allow("", null).optional()
});

const bankSchema = Joi.object({
    id: Joi.string().uuid().optional(),
    bank_name: Joi.string().required(),
    branch: Joi.string().allow("", null).optional(),
    account_holder: Joi.string().allow("", null).optional(),
    account_number: Joi.string().allow("", null).optional(),
    ifsc_code: Joi.string().allow("", null).optional(),
    swift_code: Joi.string().allow("", null).optional()
});

const createVendorSchema = Joi.object({
    vendor_code: Joi.string().required(),
    vendor_name: Joi.string().required(),
    vendor_type: Joi.string().valid("Shipping Line", "Transporter", "CHA", "CFS", "Warehouse", "Surveyor", "Other").allow("", null).optional(),
    gst_number: Joi.string().allow("", null).optional(),
    pan_number: Joi.string().allow("", null).optional(),
    contact_person: Joi.string().allow("", null).optional(),
    mobile: Joi.string().allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional(),
    country_id: Joi.string().uuid().allow(null).optional(),
    state_id: Joi.string().uuid().allow(null).optional(),
    city_id: Joi.string().uuid().allow(null).optional(),
    address: Joi.string().allow("", null).optional(),
    currency_id: Joi.string().uuid().allow(null).optional(),
    payment_terms: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional(),
    
    contacts: Joi.array().items(contactSchema).optional(),
    addresses: Joi.array().items(addressSchema).optional(),
    banks: Joi.array().items(bankSchema).optional()
});

const updateVendorSchema = Joi.object({
    vendor_code: Joi.string().optional(),
    vendor_name: Joi.string().optional(),
    vendor_type: Joi.string().valid("Shipping Line", "Transporter", "CHA", "CFS", "Warehouse", "Surveyor", "Other").allow("", null).optional(),
    gst_number: Joi.string().allow("", null).optional(),
    pan_number: Joi.string().allow("", null).optional(),
    contact_person: Joi.string().allow("", null).optional(),
    mobile: Joi.string().allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional(),
    country_id: Joi.string().uuid().allow(null).optional(),
    state_id: Joi.string().uuid().allow(null).optional(),
    city_id: Joi.string().uuid().allow(null).optional(),
    address: Joi.string().allow("", null).optional(),
    currency_id: Joi.string().uuid().allow(null).optional(),
    payment_terms: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").optional(),
    
    contacts: Joi.array().items(contactSchema).optional(),
    addresses: Joi.array().items(addressSchema).optional(),
    banks: Joi.array().items(bankSchema).optional()
}).min(1);

const statusChangeSchema = Joi.object({
    status: Joi.string().valid("Active", "Inactive").required()
});

const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100000).default(10).optional(),
    search: Joi.string().allow("", null).optional(),
    sortBy: Joi.string().default("created_at").optional(),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC").optional(),
    status: Joi.string().valid("Active", "Inactive").optional()
});

module.exports = {
    createVendorSchema,
    updateVendorSchema,
    statusChangeSchema,
    querySchema
};
