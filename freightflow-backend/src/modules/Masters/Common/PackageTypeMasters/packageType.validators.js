/**
 * @file packageType.validators.js
 * @description Joi validation schemas for Package Type Master.
 */
const Joi = require("joi");

const createPackageTypeSchema = Joi.object({
    package_type_code: Joi.string().trim().max(50).required(),
    package_type_name: Joi.string().trim().max(100).required(),
    description: Joi.string().trim().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updatePackageTypeSchema = Joi.object({
    package_type_code: Joi.string().trim().max(50).optional(),
    package_type_name: Joi.string().trim().max(100).optional(),
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
    createPackageTypeSchema,
    updatePackageTypeSchema,
    statusChangeSchema,
    querySchema
};
