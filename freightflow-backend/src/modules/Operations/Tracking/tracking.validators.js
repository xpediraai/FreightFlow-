/**
 * @file tracking.validators.js
 * @description Joi validation schemas for Tracking Module endpoints.
 */
const Joi = require("joi");

const fetchTrackingSchema = Joi.object({
    shipping_line_name: Joi.string().required().messages({
        "any.required": "Shipping Line Name is required.",
        "string.empty": "Shipping Line Name cannot be empty."
    }),
    shipping_line_id: Joi.string().uuid().optional().allow(null, ""),
    bl_number: Joi.string().min(3).max(50).required().messages({
        "any.required": "BL Number is required.",
        "string.empty": "BL Number cannot be empty."
    })
});

const confirmTrackingSchema = Joi.object({
    shipping_line_id: Joi.string().uuid().optional().allow(null, ""),
    consolidated: Joi.object().required().messages({
        "any.required": "Consolidated tracking data is required."
    }),
    sources: Joi.object().optional(),
    override_values: Joi.object({
        vessel_name: Joi.string().optional().allow(null, ""),
        voyage_number: Joi.string().optional().allow(null, ""),
        eta: Joi.date().iso().optional().allow(null),
        status: Joi.string().optional().allow(null, "")
    }).optional()
});

const overrideStatusSchema = Joi.object({
    status: Joi.string().optional(),
    tracking_mode: Joi.string().valid("Active_Monitoring", "Completed", "Cancelled", "Pending_Review").optional(),
    notes: Joi.string().optional().allow(null, "")
});

module.exports = {
    fetchTrackingSchema,
    confirmTrackingSchema,
    overrideStatusSchema
};
