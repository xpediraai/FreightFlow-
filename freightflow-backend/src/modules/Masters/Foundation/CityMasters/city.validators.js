/**
 * @file city.validators.js
 * @description Joi validation schemas for City Master.
 */
const Joi = require("joi");

const createCitySchema = Joi.object({
    country_id: Joi.string().uuid().required().messages({
        "string.empty": "Country ID is required.",
        "any.required": "Country ID is required.",
        "string.guid": "Country ID must be a valid UUID."
    }),
    state_id: Joi.string().uuid().required().messages({
        "string.empty": "State ID is required.",
        "any.required": "State ID is required.",
        "string.guid": "State ID must be a valid UUID."
    }),
    city_code: Joi.string().required().messages({
        "string.empty": "City Code is required.",
        "any.required": "City Code is required."
    }),
    city_name: Joi.string().required().messages({
        "string.empty": "City Name is required.",
        "any.required": "City Name is required."
    }),
    gst: Joi.string().allow("", null).optional(),
    pincode: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateCitySchema = Joi.object({
    country_id: Joi.string().uuid().optional().messages({
        "string.guid": "Country ID must be a valid UUID."
    }),
    state_id: Joi.string().uuid().optional().messages({
        "string.guid": "State ID must be a valid UUID."
    }),
    city_code: Joi.string().optional(),
    city_name: Joi.string().optional(),
    gst: Joi.string().allow("", null).optional(),
    pincode: Joi.string().allow("", null).optional(),
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
    limit: Joi.number().integer().min(1).max(100000).default(10).optional(),
    search: Joi.string().allow("", null).optional(),
    sortBy: Joi.string().default("created_at").optional(),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC").optional(),
    status: Joi.string().valid("Active", "Inactive").optional(),
    country_id: Joi.string().uuid().optional().messages({
        "string.guid": "Country ID filter must be a valid UUID."
    }),
    state_id: Joi.string().uuid().optional().messages({
        "string.guid": "State ID filter must be a valid UUID."
    })
});

module.exports = {
    createCitySchema,
    updateCitySchema,
    statusChangeSchema,
    querySchema
};
