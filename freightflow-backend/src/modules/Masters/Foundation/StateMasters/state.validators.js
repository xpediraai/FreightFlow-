/**
 * @file state.validators.js
 * @description Joi validation schemas for State Master.
 */
const Joi = require("joi");

const createStateSchema = Joi.object({
    country_id: Joi.string().uuid().required().messages({
        "string.empty": "Country ID is required.",
        "any.required": "Country ID is required.",
        "string.guid": "Country ID must be a valid UUID."
    }),
    state_code: Joi.string().required().messages({
        "string.empty": "State Code is required.",
        "any.required": "State Code is required."
    }),
    state_name: Joi.string().required().messages({
        "string.empty": "State Name is required.",
        "any.required": "State Name is required."
    }),
    gst_state_code: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateStateSchema = Joi.object({
    country_id: Joi.string().uuid().optional().messages({
        "string.guid": "Country ID must be a valid UUID."
    }),
    state_code: Joi.string().optional(),
    state_name: Joi.string().optional(),
    gst_state_code: Joi.string().allow("", null).optional(),
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
    country_id: Joi.string().uuid().optional().messages({
        "string.guid": "Country ID filter must be a valid UUID."
    })
});

module.exports = {
    createStateSchema,
    updateStateSchema,
    statusChangeSchema,
    querySchema
};
