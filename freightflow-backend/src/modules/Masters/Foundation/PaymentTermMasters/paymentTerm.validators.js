/**
 * @file paymentTerm.validators.js
 * @description Joi validation schemas for Payment Term Master.
 */
const Joi = require("joi");

const createPaymentTermSchema = Joi.object({
    payment_term_code: Joi.string().trim().max(50).required(),
    payment_term_name: Joi.string().trim().max(100).required(),
    credit_days: Joi.number().integer().min(0).required(),
    description: Joi.string().trim().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updatePaymentTermSchema = Joi.object({
    payment_term_code: Joi.string().trim().max(50).optional(),
    payment_term_name: Joi.string().trim().max(100).optional(),
    credit_days: Joi.number().integer().min(0).optional(),
    description: Joi.string().trim().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").optional()
}).min(1);

const statusChangeSchema = Joi.object({
    status: Joi.string().valid("Active", "Inactive").required()
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
    createPaymentTermSchema,
    updatePaymentTermSchema,
    statusChangeSchema,
    querySchema
};
