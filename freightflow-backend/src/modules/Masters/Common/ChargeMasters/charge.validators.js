/**
 * @file charge.validators.js
 * @description Joi validation schemas for Charge Master.
 */
const Joi = require("joi");

const createChargeSchema = Joi.object({
    id: Joi.string().optional().allow("", null),
    charge_code: Joi.string().trim().max(50).required(),
    charge_name: Joi.string().trim().max(100).required(),
    basis: Joi.string().trim().allow("", null).optional().default("Per Container"),
    default_rate: Joi.number().min(0).allow(null).optional().default(0),
    default_qty: Joi.number().integer().min(1).allow(null).optional().default(1),
    default_applicable: Joi.boolean().allow(null).optional().default(true),
    charge_type: Joi.string().valid("Revenue", "Expense", "Both").optional().default("Revenue"),
    applicable_module: Joi.string().valid("Inquiry", "Quotation", "Shipment", "Customs", "Billing", "Transport").optional().default("Quotation"),
    tax_applicable: Joi.boolean().default(false).optional(),
    default_currency: Joi.string().uuid().allow("", null).optional(),
    description: Joi.string().trim().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
}).unknown(true);

const updateChargeSchema = Joi.object({
    id: Joi.string().optional().allow("", null),
    charge_code: Joi.string().trim().max(50).optional(),
    charge_name: Joi.string().trim().max(100).optional(),
    basis: Joi.string().trim().allow("", null).optional(),
    default_rate: Joi.number().min(0).allow(null).optional(),
    default_qty: Joi.number().integer().min(1).allow(null).optional(),
    default_applicable: Joi.boolean().allow(null).optional(),
    charge_type: Joi.string().valid("Revenue", "Expense", "Both").optional(),
    applicable_module: Joi.string().valid("Inquiry", "Quotation", "Shipment", "Customs", "Billing", "Transport").optional(),
    tax_applicable: Joi.boolean().optional(),
    default_currency: Joi.string().uuid().allow("", null).optional(),
    description: Joi.string().trim().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").optional()
}).min(1).unknown(true);

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
