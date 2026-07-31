/**
 * @file job.validators.js
 * @description Joi validation schemas for Job APIs.
 */
const Joi = require("joi");

const createJobSchema = Joi.object({
    shipment_id: Joi.string().required(),
    assigned_employee_id: Joi.string().optional().allow("", null),
    department_id: Joi.string().optional().allow("", null),
    priority: Joi.string().valid("Low", "Medium", "High", "Urgent").default("Medium"),
    status: Joi.string().valid("Pending", "In-Progress", "Completed", "On-Hold", "Cancelled").default("Pending"),
    remarks: Joi.string().max(1000).optional().allow("", null)
}).options({ stripUnknown: true });

const updateJobSchema = Joi.object({
    assigned_employee_id: Joi.string().optional().allow("", null),
    department_id: Joi.string().optional().allow("", null),
    priority: Joi.string().valid("Low", "Medium", "High", "Urgent").optional(),
    status: Joi.string().valid("Pending", "In-Progress", "Completed", "On-Hold", "Cancelled").optional(),
    remarks: Joi.string().max(1000).optional().allow("", null)
}).options({ stripUnknown: true });

const statusChangeSchema = Joi.object({
    status: Joi.string().valid("Pending", "In-Progress", "Completed", "On-Hold", "Cancelled").required()
});

const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(10000).default(20),
    search: Joi.string().allow("", null),
    status: Joi.string().allow("", null),
    priority: Joi.string().allow("", null),
    assigned_employee_id: Joi.string().allow("", null),
    shipment_id: Joi.string().allow("", null)
}).options({ stripUnknown: true });

module.exports = {
    createJobSchema,
    updateJobSchema,
    statusChangeSchema,
    querySchema
};
