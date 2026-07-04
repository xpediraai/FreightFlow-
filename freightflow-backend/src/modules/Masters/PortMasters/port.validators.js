/**
 * @file port.validators.js
 * @description Joi validation schemas for Port Master.
 */
const Joi = require("joi");

const createPortSchema = Joi.object({
    port_code: Joi.string().required().messages({
        "string.empty": "Port Code is required.",
        "any.required": "Port Code is required."
    }),
    port_name: Joi.string().required().messages({
        "string.empty": "Port Name is required.",
        "any.required": "Port Name is required."
    }),
    country_id: Joi.string().uuid().required().messages({
        "string.empty": "Country ID is required.",
        "any.required": "Country ID is required.",
        "string.guid": "Country ID must be a valid UUID."
    }),
    state_id: Joi.string().uuid().allow(null, "").optional().messages({
        "string.guid": "State ID must be a valid UUID."
    }),
    city_id: Joi.string().uuid().allow(null, "").optional().messages({
        "string.guid": "City ID must be a valid UUID."
    }),
    time_zone: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updatePortSchema = Joi.object({
    port_code: Joi.string().optional(),
    port_name: Joi.string().optional(),
    country_id: Joi.string().uuid().optional().messages({
        "string.guid": "Country ID must be a valid UUID."
    }),
    state_id: Joi.string().uuid().allow(null, "").optional().messages({
        "string.guid": "State ID must be a valid UUID."
    }),
    city_id: Joi.string().uuid().allow(null, "").optional().messages({
        "string.guid": "City ID must be a valid UUID."
    }),
    time_zone: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").optional()
}).min(1).messages({
    "object.min": "At least one field must be provided for update."
});

const statusChangeSchema = Joi.object({
    status: Joi.string().valid("Active", "Inactive").required().messages({
        "any.required": "Status is required.",
        "any.only": "Status must be either Active or Inactive."
    })
});

const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    search: Joi.string().allow("", null).optional(),
    sortBy: Joi.string().default("created_at").optional(),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC").optional(),
    status: Joi.string().valid("Active", "Inactive").optional(),
    country_id: Joi.string().uuid().optional(),
    state_id: Joi.string().uuid().optional(),
    city_id: Joi.string().uuid().optional()
});

module.exports = {
    createPortSchema,
    updatePortSchema,
    statusChangeSchema,
    querySchema
};
