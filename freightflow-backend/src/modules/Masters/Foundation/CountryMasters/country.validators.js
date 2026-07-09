/**
 * @file country.validators.js
 * @description Joi validation schemas for Country Master.
 */
const Joi = require("joi");

const createCountrySchema = Joi.object({
    country_code: Joi.string().required().messages({
        "string.empty": "Country Code is required.",
        "any.required": "Country Code is required."
    }),
    country_name: Joi.string().required().messages({
        "string.empty": "Country Name is required.",
        "any.required": "Country Name is required."
    }),
    phone_code: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateCountrySchema = Joi.object({
    country_code: Joi.string().optional(),
    country_name: Joi.string().optional(),
    phone_code: Joi.string().allow("", null).optional(),
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
    status: Joi.string().valid("Active", "Inactive").optional()
});

module.exports = {
    createCountrySchema,
    updateCountrySchema,
    statusChangeSchema,
    querySchema
};
