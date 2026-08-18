/**
 * @file shippingLine.validators.js
 * @description Joi validation schemas for Shipping Line Master.
 */
const Joi = require("joi");

const createShippingLineSchema = Joi.object({
    shipping_line_code: Joi.string().required().messages({
        "string.empty": "Shipping Line Code is required.",
        "any.required": "Shipping Line Code is required."
    }),
    shipping_line_name: Joi.string().required().messages({
        "string.empty": "Shipping Line Name is required.",
        "any.required": "Shipping Line Name is required."
    }),
    scac_code: Joi.string().allow("", null).optional(),
    website: Joi.string().uri().allow("", null).optional().messages({
        "string.uri": "Website must be a valid URL."
    }),
    tracking_url: Joi.string().allow("", null).optional(),
    tracking_method: Joi.string().valid("PUPPETEER_SCRAPE", "REST_API", "GENERIC_FETCH").optional(),
    tracking_config: Joi.object().optional(),
    bic_prefix: Joi.string().max(4).allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional().messages({
        "string.email": "Email must be a valid email address."
    }),
    phone: Joi.string().allow("", null).optional(),
    country_id: Joi.string().uuid().allow(null, "").optional().messages({
        "string.guid": "Country ID must be a valid UUID."
    }),
    contact_person: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateShippingLineSchema = Joi.object({
    shipping_line_code: Joi.string().optional(),
    shipping_line_name: Joi.string().optional(),
    scac_code: Joi.string().allow("", null).optional(),
    website: Joi.string().uri().allow("", null).optional().messages({
        "string.uri": "Website must be a valid URL."
    }),
    tracking_url: Joi.string().allow("", null).optional(),
    tracking_method: Joi.string().valid("PUPPETEER_SCRAPE", "REST_API", "GENERIC_FETCH").optional(),
    tracking_config: Joi.object().optional(),
    bic_prefix: Joi.string().max(4).allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional().messages({
        "string.email": "Email must be a valid email address."
    }),
    phone: Joi.string().allow("", null).optional(),
    country_id: Joi.string().uuid().allow(null, "").optional().messages({
        "string.guid": "Country ID must be a valid UUID."
    }),
    contact_person: Joi.string().allow("", null).optional(),
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
    country_id: Joi.string().uuid().optional()
});

module.exports = {
    createShippingLineSchema,
    updateShippingLineSchema,
    statusChangeSchema,
    querySchema
};
