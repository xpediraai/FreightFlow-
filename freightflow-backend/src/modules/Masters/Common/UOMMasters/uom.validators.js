/**
 * @file uom.validators.js
 * @description Joi validation schemas for UOM Master.
 */
const Joi = require("joi");

const createUOMSchema = Joi.object({
    uom_code: Joi.string().trim().max(50).required(),
    uom_name: Joi.string().trim().max(100).required(),
    symbol: Joi.string().trim().max(20).allow("", null).optional(),
    description: Joi.string().trim().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateUOMSchema = Joi.object({
    uom_code: Joi.string().trim().max(50).optional(),
    uom_name: Joi.string().trim().max(100).optional(),
    symbol: Joi.string().trim().max(20).allow("", null).optional(),
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
    createUOMSchema,
    updateUOMSchema,
    statusChangeSchema,
    querySchema
};
