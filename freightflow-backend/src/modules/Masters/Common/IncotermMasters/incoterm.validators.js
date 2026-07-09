/**
 * @file incoterm.validators.js
 * @description Joi validation schemas for Incoterm Master.
 */
const Joi = require("joi");

const createIncotermSchema = Joi.object({
    incoterm_code: Joi.string().trim().max(50).required(),
    incoterm_name: Joi.string().trim().max(100).required(),
    transport_mode: Joi.string().trim().max(100).allow("", null).optional(),
    description: Joi.string().trim().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateIncotermSchema = Joi.object({
    incoterm_code: Joi.string().trim().max(50).optional(),
    incoterm_name: Joi.string().trim().max(100).optional(),
    transport_mode: Joi.string().trim().max(100).allow("", null).optional(),
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
    createIncotermSchema,
    updateIncotermSchema,
    statusChangeSchema,
    querySchema
};
