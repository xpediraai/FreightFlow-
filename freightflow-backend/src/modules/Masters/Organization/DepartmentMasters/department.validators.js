/**
 * @file department.validators.js
 * @description Joi validation schemas for Department Master.
 */
const Joi = require("joi");

const createDepartmentSchema = Joi.object({
    department_code: Joi.string().required(),
    department_name: Joi.string().required(),
    description: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateDepartmentSchema = Joi.object({
    department_code: Joi.string().optional(),
    department_name: Joi.string().optional(),
    description: Joi.string().allow("", null).optional(),
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
    createDepartmentSchema,
    updateDepartmentSchema,
    statusChangeSchema,
    querySchema
};
