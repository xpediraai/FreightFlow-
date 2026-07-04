/**
 * @file warehouse.validators.js
 * @description Joi validation schemas for Warehouse Master.
 */
const Joi = require("joi");

const createWarehouseSchema = Joi.object({
    warehouse_code: Joi.string().required(),
    warehouse_name: Joi.string().required(),
    warehouse_type: Joi.string().allow("", null).optional(),
    country_id: Joi.string().uuid().allow(null).optional(),
    state_id: Joi.string().uuid().allow(null).optional(),
    city_id: Joi.string().uuid().allow(null).optional(),
    address: Joi.string().allow("", null).optional(),
    pincode: Joi.string().allow("", null).optional(),
    contact_person: Joi.string().allow("", null).optional(),
    mobile: Joi.string().allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional(),
    capacity: Joi.number().allow(null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateWarehouseSchema = Joi.object({
    warehouse_code: Joi.string().optional(),
    warehouse_name: Joi.string().optional(),
    warehouse_type: Joi.string().allow("", null).optional(),
    country_id: Joi.string().uuid().allow(null).optional(),
    state_id: Joi.string().uuid().allow(null).optional(),
    city_id: Joi.string().uuid().allow(null).optional(),
    address: Joi.string().allow("", null).optional(),
    pincode: Joi.string().allow("", null).optional(),
    contact_person: Joi.string().allow("", null).optional(),
    mobile: Joi.string().allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional(),
    capacity: Joi.number().allow(null).optional(),
    status: Joi.string().valid("Active", "Inactive").optional()
}).min(1);

const statusChangeSchema = Joi.object({
    status: Joi.string().valid("Active", "Inactive").required()
});

const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    search: Joi.string().allow("", null).optional(),
    sortBy: Joi.string().default("created_at").optional(),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC").optional(),
    status: Joi.string().valid("Active", "Inactive").optional()
});

module.exports = {
    createWarehouseSchema,
    updateWarehouseSchema,
    statusChangeSchema,
    querySchema
};
