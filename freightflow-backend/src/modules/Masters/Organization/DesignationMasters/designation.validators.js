/**
 * @file designation.validators.js
 * @description Joi validation schemas for Designation Master.
 */
const Joi = require("joi");

const createDesignationSchema = Joi.object({
    department_id: Joi.string().uuid().allow(null).optional(),
    designation_code: Joi.string().required(),
    designation_name: Joi.string().required(),
    description: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateDesignationSchema = Joi.object({
    department_id: Joi.string().uuid().allow(null).optional(),
    designation_code: Joi.string().optional(),
    designation_name: Joi.string().optional(),
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
    status: Joi.string().valid("Active", "Inactive").optional(),
    department_id: Joi.string().uuid().allow(null).optional()
});

module.exports = {
    createDesignationSchema,
    updateDesignationSchema,
    statusChangeSchema,
    querySchema
};
