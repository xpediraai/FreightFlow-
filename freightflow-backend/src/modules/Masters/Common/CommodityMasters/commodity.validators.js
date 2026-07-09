/**
 * @file commodity.validators.js
 * @description Joi validation schemas for Commodity Master.
 */
const Joi = require("joi");

const createCommoditySchema = Joi.object({
    commodity_code: Joi.string().required().messages({
        "string.empty": "Commodity Code is required.",
        "any.required": "Commodity Code is required."
    }),
    commodity_name: Joi.string().required().messages({
        "string.empty": "Commodity Name is required.",
        "any.required": "Commodity Name is required."
    }),
    hs_code: Joi.string().allow("", null).optional(),
    description: Joi.string().allow("", null).optional(),
    hazardous: Joi.string().valid("Yes", "No").default("No").optional(),
    hazard_class: Joi.alternatives().conditional('hazardous', {
        is: 'Yes',
        then: Joi.string().required().messages({
            "any.required": "Hazard Class is required when Hazardous is Yes.",
            "string.empty": "Hazard Class cannot be empty when Hazardous is Yes."
        }),
        otherwise: Joi.string().allow("", null).optional()
    }),
    default_unit: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("Active", "Inactive").default("Active").optional()
});

const updateCommoditySchema = Joi.object({
    commodity_code: Joi.string().optional(),
    commodity_name: Joi.string().optional(),
    hs_code: Joi.string().allow("", null).optional(),
    description: Joi.string().allow("", null).optional(),
    hazardous: Joi.string().valid("Yes", "No").optional(),
    hazard_class: Joi.string().allow("", null).optional(),
    default_unit: Joi.string().allow("", null).optional(),
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
    hazardous: Joi.string().valid("Yes", "No").optional()
});

module.exports = {
    createCommoditySchema,
    updateCommoditySchema,
    statusChangeSchema,
    querySchema
};
