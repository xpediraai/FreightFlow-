/**
 * @file currency.validators.js
 * @description Joi validation schemas for Currency Master.
 */
const Joi = require("joi");

const createCurrencySchema = Joi.object({
    currency_code: Joi.string().required().messages({
        "string.empty": "Currency Code is required.",
        "any.required": "Currency Code is required."
    }),
    currency_name: Joi.string().required().messages({
        "string.empty": "Currency Name is required.",
        "any.required": "Currency Name is required."
    }),
    symbol: Joi.string().allow("", null).optional(),
    exchange_rate: Joi.number().positive().default(1).optional().messages({
        "number.positive": "Exchange rate must be a positive number."
    }),
    base_currency: Joi.string().valid("Yes", "No").default("No").optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateCurrencySchema = Joi.object({
    currency_code: Joi.string().optional(),
    currency_name: Joi.string().optional(),
    symbol: Joi.string().allow("", null).optional(),
    exchange_rate: Joi.number().positive().optional().messages({
        "number.positive": "Exchange rate must be a positive number."
    }),
    base_currency: Joi.string().valid("Yes", "No").optional(),
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
    base_currency: Joi.string().valid("Yes", "No").optional()
});

module.exports = {
    createCurrencySchema,
    updateCurrencySchema,
    statusChangeSchema,
    querySchema
};
