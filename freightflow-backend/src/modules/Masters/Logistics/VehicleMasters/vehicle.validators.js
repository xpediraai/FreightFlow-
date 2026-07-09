/**
 * @file vehicle.validators.js
 * @description Joi validation schemas for Vehicle Master.
 */
const Joi = require("joi");

const createVehicleSchema = Joi.object({
    vehicle_number: Joi.string().required(),
    vehicle_type: Joi.string().allow("", null).optional(),
    vehicle_capacity: Joi.number().allow(null).optional(),
    vehicle_owner: Joi.string().allow("", null).optional(),
    vendor_id: Joi.string().uuid().allow(null).optional(),
    registration_number: Joi.string().allow("", null).optional(),
    registration_expiry: Joi.date().iso().allow(null).optional(),
    insurance_number: Joi.string().allow("", null).optional(),
    insurance_expiry: Joi.date().iso().allow(null).optional(),
    fitness_expiry: Joi.date().iso().allow(null).optional(),
    pollution_expiry: Joi.date().iso().allow(null).optional(),
    gps_enabled: Joi.string().valid("Yes", "No").default("No").optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateVehicleSchema = Joi.object({
    vehicle_number: Joi.string().optional(),
    vehicle_type: Joi.string().allow("", null).optional(),
    vehicle_capacity: Joi.number().allow(null).optional(),
    vehicle_owner: Joi.string().allow("", null).optional(),
    vendor_id: Joi.string().uuid().allow(null).optional(),
    registration_number: Joi.string().allow("", null).optional(),
    registration_expiry: Joi.date().iso().allow(null).optional(),
    insurance_number: Joi.string().allow("", null).optional(),
    insurance_expiry: Joi.date().iso().allow(null).optional(),
    fitness_expiry: Joi.date().iso().allow(null).optional(),
    pollution_expiry: Joi.date().iso().allow(null).optional(),
    gps_enabled: Joi.string().valid("Yes", "No").optional(),
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
    createVehicleSchema,
    updateVehicleSchema,
    statusChangeSchema,
    querySchema
};
