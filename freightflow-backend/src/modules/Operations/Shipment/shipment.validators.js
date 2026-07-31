/**
 * @file shipment.validators.js
 * @description Joi validation schemas for Shipment APIs.
 */
const Joi = require("joi");

const createShipmentSchema = Joi.object({
    shipment_number: Joi.string().optional().allow("", null),
    shipment_date: Joi.date().iso().required(),
    branch_id: Joi.string().optional().allow("", null),
    customer_id: Joi.string().required(),
    vendor_id: Joi.string().optional().allow("", null),
    agent_id: Joi.string().optional().allow("", null),
    shipment_type: Joi.string().valid("Import", "Export", "Domestic", "Cross-Trade").default("Export"),
    service_type_id: Joi.string().optional().allow("", null),
    sales_person_id: Joi.string().optional().allow("", null),
    operation_executive_id: Joi.string().optional().allow("", null),
    
    // Cargo
    commodity_id: Joi.string().optional().allow("", null),
    package_type_id: Joi.string().optional().allow("", null),
    uom_id: Joi.string().optional().allow("", null),
    gross_weight: Joi.number().min(0).optional().allow("", null),
    volume_cbm: Joi.number().min(0).optional().allow("", null),
    no_of_packages: Joi.number().integer().min(0).optional().allow("", null),
    is_dangerous_goods: Joi.boolean().default(false),

    // Route
    origin_country_id: Joi.string().optional().allow("", null),
    origin_port_id: Joi.string().optional().allow("", null),
    destination_country_id: Joi.string().optional().allow("", null),
    destination_port_id: Joi.string().optional().allow("", null),
    final_destination: Joi.string().max(255).optional().allow("", null),

    // Transport
    transport_mode_id: Joi.string().optional().allow("", null),
    shipping_line_id: Joi.string().optional().allow("", null),
    vehicle_id: Joi.string().optional().allow("", null),
    warehouse_id: Joi.string().optional().allow("", null),
    etd: Joi.date().iso().optional().allow("", null),
    eta: Joi.date().iso().optional().allow("", null),

    // Commercial
    currency_id: Joi.string().optional().allow("", null),
    exchange_rate: Joi.number().min(0).optional().allow("", null),
    payment_term_id: Joi.string().optional().allow("", null),
    incoterm_id: Joi.string().optional().allow("", null),
    charge_id: Joi.string().optional().allow("", null),

    status: Joi.string().valid("Draft", "Confirmed", "In-Transit", "Delivered", "Cancelled").default("Draft"),
    remarks: Joi.string().max(1000).optional().allow("", null)
}).options({ stripUnknown: true });

const updateShipmentSchema = createShipmentSchema.keys({
    shipment_date: Joi.date().iso().optional(),
    customer_id: Joi.string().optional()
}).options({ stripUnknown: true });

const statusChangeSchema = Joi.object({
    status: Joi.string().valid("Draft", "Confirmed", "In-Transit", "Delivered", "Cancelled").required()
});

const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(10000).default(20),
    search: Joi.string().allow("", null),
    status: Joi.string().allow("", null),
    customer_id: Joi.string().allow("", null),
    shipment_type: Joi.string().allow("", null),
    origin_country_id: Joi.string().allow("", null),
    destination_country_id: Joi.string().allow("", null),
    origin_port_id: Joi.string().allow("", null),
    destination_port_id: Joi.string().allow("", null),
    etd: Joi.date().iso().allow("", null),
    eta: Joi.date().iso().allow("", null)
}).options({ stripUnknown: true });

module.exports = {
    createShipmentSchema,
    updateShipmentSchema,
    statusChangeSchema,
    querySchema
};
