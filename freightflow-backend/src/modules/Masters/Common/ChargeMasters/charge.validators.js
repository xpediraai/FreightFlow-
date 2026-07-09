/**
 * @file charge.validators.js
 * @description Joi validation schemas for Charge Master.
 */
const Joi = require("joi");

const createChargeSchema = Joi.object({
    charge_code: Joi.string().trim().max(50).required(),
    charge_name: Joi.string().trim().max(100).required(),
    charge_type: Joi.string().valid("Revenue", "Expense", "Both").required(),
    applicable_module: Joi.string().valid("Inquiry", "Quotation", "Shipment", "Customs", "Billing", "Transport").required(),
    tax_applicable: Joi.boolean().default(false).optional(),
    default_currency: Joi.string().uuid().allow(null).optional(),
    description: Joi.string().trim().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateChargeSchema = Joi.object({
    charge_code: Joi.string().trim().max(50).optional(),
    charge_name: Joi.string().trim().max(100).optional(),
    charge_type: Joi.string().valid("Revenue", "Expense", "Both").optional(),
    applicable_module: Joi.string().valid("Inquiry", "Quotation", "Shipment", "Customs", "Billing", "Transport").optional(),
    tax_applicable: Joi.boolean().optional(),
    default_currency: Joi.string().uuid().allow(null).optional(),
    description: Joi.string().trim().allow("", null).optional(),
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
    createChargeSchema,
    updateChargeSchema,
    statusChangeSchema,
    querySchema
};
