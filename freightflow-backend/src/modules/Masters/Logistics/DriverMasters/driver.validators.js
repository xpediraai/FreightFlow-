/**
 * @file driver.validators.js
 * @description Joi validation schemas for Driver Master.
 */
const Joi = require("joi");

const createDriverSchema = Joi.object({
    driver_code: Joi.string().required(),
    driver_name: Joi.string().required(),
    mobile: Joi.string().allow("", null).optional(),
    alternate_mobile: Joi.string().allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional(),
    address: Joi.string().allow("", null).optional(),
    country_id: Joi.string().uuid().allow(null).optional(),
    state_id: Joi.string().uuid().allow(null).optional(),
    city_id: Joi.string().uuid().allow(null).optional(),
    license_number: Joi.string().allow("", null).optional(),
    license_type: Joi.string().allow("", null).optional(),
    license_expiry: Joi.date().iso().allow(null).optional(),
    aadhaar_number: Joi.string().allow("", null).optional(),
    pan_number: Joi.string().allow("", null).optional(),
    vendor_id: Joi.string().uuid().allow(null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateDriverSchema = Joi.object({
    driver_code: Joi.string().optional(),
    driver_name: Joi.string().optional(),
    mobile: Joi.string().allow("", null).optional(),
    alternate_mobile: Joi.string().allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional(),
    address: Joi.string().allow("", null).optional(),
    country_id: Joi.string().uuid().allow(null).optional(),
    state_id: Joi.string().uuid().allow(null).optional(),
    city_id: Joi.string().uuid().allow(null).optional(),
    license_number: Joi.string().allow("", null).optional(),
    license_type: Joi.string().allow("", null).optional(),
    license_expiry: Joi.date().iso().allow(null).optional(),
    aadhaar_number: Joi.string().allow("", null).optional(),
    pan_number: Joi.string().allow("", null).optional(),
    vendor_id: Joi.string().uuid().allow(null).optional(),
    status: Joi.string().valid("Active", "Inactive").optional()
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
    createDriverSchema,
    updateDriverSchema,
    statusChangeSchema,
    querySchema
};
