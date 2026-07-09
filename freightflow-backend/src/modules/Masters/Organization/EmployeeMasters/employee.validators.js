/**
 * @file employee.validators.js
 * @description Joi validation schemas for Employee Master.
 */
const Joi = require("joi");

const createEmployeeSchema = Joi.object({
    employee_code: Joi.string().allow("", null).optional(),
    first_name: Joi.string().required(),
    middle_name: Joi.string().allow("", null).optional(),
    last_name: Joi.string().allow("", null).optional(),
    gender: Joi.string().allow("", null).optional(),
    dob: Joi.date().iso().allow(null).optional(),
    doj: Joi.date().iso().allow(null).optional(),
    mobile: Joi.string().allow("", null).optional(),
    alternate_mobile: Joi.string().allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional(),
    department_id: Joi.string().uuid().required(),
    designation_id: Joi.string().uuid().required(),
    country_id: Joi.string().uuid().allow(null).optional(),
    state_id: Joi.string().uuid().allow(null).optional(),
    city_id: Joi.string().uuid().allow(null).optional(),
    address_line_1: Joi.string().allow("", null).optional(),
    address_line_2: Joi.string().allow("", null).optional(),
    pincode: Joi.string().allow("", null).optional(),
    aadhaar: Joi.string().allow("", null).optional(),
    pan: Joi.string().allow("", null).optional(),
    passport: Joi.string().allow("", null).optional(),
    reporting_manager: Joi.string().uuid().allow(null).optional(),
    employment_type: Joi.string().allow("", null).optional(),
    blood_group: Joi.string().allow("", null).optional(),
    emergency_contact: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateEmployeeSchema = Joi.object({
    employee_code: Joi.string().allow("", null).optional(),
    first_name: Joi.string().optional(),
    middle_name: Joi.string().allow("", null).optional(),
    last_name: Joi.string().allow("", null).optional(),
    gender: Joi.string().allow("", null).optional(),
    dob: Joi.date().iso().allow(null).optional(),
    doj: Joi.date().iso().allow(null).optional(),
    mobile: Joi.string().allow("", null).optional(),
    alternate_mobile: Joi.string().allow("", null).optional(),
    email: Joi.string().email().allow("", null).optional(),
    department_id: Joi.string().uuid().optional(),
    designation_id: Joi.string().uuid().optional(),
    country_id: Joi.string().uuid().allow(null).optional(),
    state_id: Joi.string().uuid().allow(null).optional(),
    city_id: Joi.string().uuid().allow(null).optional(),
    address_line_1: Joi.string().allow("", null).optional(),
    address_line_2: Joi.string().allow("", null).optional(),
    pincode: Joi.string().allow("", null).optional(),
    aadhaar: Joi.string().allow("", null).optional(),
    pan: Joi.string().allow("", null).optional(),
    passport: Joi.string().allow("", null).optional(),
    reporting_manager: Joi.string().uuid().allow(null).optional(),
    employment_type: Joi.string().allow("", null).optional(),
    blood_group: Joi.string().allow("", null).optional(),
    emergency_contact: Joi.string().allow("", null).optional(),
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
    createEmployeeSchema,
    updateEmployeeSchema,
    statusChangeSchema,
    querySchema
};
