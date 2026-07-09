/**
 * @file containerType.validators.js
 * @description Joi validation schemas for Container Type Master.
 */
const Joi = require("joi");

const createContainerTypeSchema = Joi.object({
    container_code: Joi.string().required().messages({
        "string.empty": "Container Code is required.",
        "any.required": "Container Code is required."
    }),
    container_name: Joi.string().required().messages({
        "string.empty": "Container Name is required.",
        "any.required": "Container Name is required."
    }),
    iso_code: Joi.string().required().messages({
        "string.empty": "ISO Code is required.",
        "any.required": "ISO Code is required."
    }),
    size: Joi.string().valid("20", "40", "45").required().messages({
        "any.required": "Size is required.",
        "any.only": "Size must be 20, 40, or 45."
    }),
    category: Joi.string().valid("Dry", "Reefer", "Open Top", "Flat Rack", "Tank").required().messages({
        "any.required": "Category is required.",
        "any.only": "Category must be Dry, Reefer, Open Top, Flat Rack, or Tank."
    }),
    capacity_cbm: Joi.number().min(0).allow(null).optional(),
    max_weight: Joi.number().min(0).allow(null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateContainerTypeSchema = Joi.object({
    container_code: Joi.string().optional(),
    container_name: Joi.string().optional(),
    iso_code: Joi.string().optional(),
    size: Joi.string().valid("20", "40", "45").optional(),
    category: Joi.string().valid("Dry", "Reefer", "Open Top", "Flat Rack", "Tank").optional(),
    capacity_cbm: Joi.number().min(0).allow(null).optional(),
    max_weight: Joi.number().min(0).allow(null).optional(),
    status: Joi.string().valid("Active", "Inactive").optional()
}).min(1).messages({
    "object.min": "At least one field must be provided for update."
});

const statusChangeSchema = Joi.object({
    status: Joi.string().valid("Active", "Inactive").required().messages({
        "any.required": "Status is required.",
        "any.only": "Status must be either Active or Inactive."
    })
});

const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100000).default(10).optional(),
    search: Joi.string().allow("", null).optional(),
    sortBy: Joi.string().default("created_at").optional(),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC").optional(),
    status: Joi.string().valid("Active", "Inactive").optional(),
    size: Joi.string().valid("20", "40", "45").optional(),
    category: Joi.string().valid("Dry", "Reefer", "Open Top", "Flat Rack", "Tank").optional()
});

module.exports = {
    createContainerTypeSchema,
    updateContainerTypeSchema,
    statusChangeSchema,
    querySchema
};
