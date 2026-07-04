/**
 * @file transportMode.validators.js
 * @description Joi validation schemas for Transport Mode Master.
 */
const Joi = require("joi");

const createTransportModeSchema = Joi.object({
    mode_code: Joi.string().required().messages({
        "string.empty": "Mode Code is required.",
        "any.required": "Mode Code is required."
    }),
    mode_name: Joi.string().required().messages({
        "string.empty": "Mode Name is required.",
        "any.required": "Mode Name is required."
    }),
    description: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateTransportModeSchema = Joi.object({
    mode_code: Joi.string().optional(),
    mode_name: Joi.string().optional(),
    description: Joi.string().allow("", null).optional(),
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
    status: Joi.string().valid("Active", "Inactive").optional()
});

module.exports = {
    createTransportModeSchema,
    updateTransportModeSchema,
    statusChangeSchema,
    querySchema
};
