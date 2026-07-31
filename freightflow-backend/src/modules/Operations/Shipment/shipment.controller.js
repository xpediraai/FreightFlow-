/**
 * @file shipment.controller.js
 * @description HTTP layer for Shipment APIs.
 */
const { 
    createShipmentSchema, 
    updateShipmentSchema, 
    statusChangeSchema, 
    querySchema 
} = require("./shipment.validators");
const shipmentService = require("./shipment.service");
const { successResponse, errorResponse } = require("../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createShipmentSchema.validate(req.body);
        if (error) {
            return res.status(400).json(errorResponse(
                "VALIDATION_ERROR",
                error.details[0].message,
                error.details[0].message
            ));
        }

        const userId = req.user.user_id;
        const companyId = req.user.company_id;

        if (!companyId) {
            return res.status(401).json(errorResponse("UNAUTHORIZED", "Company ID missing in token.", "Unauthorized access."));
        }

        const reqInfo = {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"]
        };

        const shipment = await shipmentService.createShipment(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "SHIPMENT_CREATED",
            "Shipment created successfully.",
            "Shipment created successfully.",
            shipment
        ));
    } catch (err) {
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create shipment."));
    }
};

const list = async (req, res) => {
    try {
        const { error, value } = querySchema.validate(req.query);
        if (error) {
            return res.status(400).json(errorResponse(
                "VALIDATION_ERROR",
                error.details[0].message,
                error.details[0].message
            ));
        }

        const companyId = req.user.company_id;
        if (!companyId) {
            return res.status(401).json(errorResponse("UNAUTHORIZED", "Company ID missing in token.", "Unauthorized access."));
        }

        const data = await shipmentService.getShipments(companyId, value);

        return res.status(200).json(successResponse(
            "SHIPMENTS_FETCHED",
            "Shipments fetched successfully.",
            "Shipments retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch shipments."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const shipment = await shipmentService.getShipmentById(companyId, id);

        return res.status(200).json(successResponse(
            "SHIPMENT_FETCHED",
            "Shipment fetched successfully.",
            "Shipment retrieved.",
            shipment
        ));
    } catch (err) {
        if (err.message === "Shipment not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch shipment."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateShipmentSchema.validate(req.body);
        if (error) {
            return res.status(400).json(errorResponse(
                "VALIDATION_ERROR",
                error.details[0].message,
                error.details[0].message
            ));
        }

        const userId = req.user.user_id;
        const companyId = req.user.company_id;

        const reqInfo = {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"]
        };

        const updated = await shipmentService.updateShipment(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "SHIPMENT_UPDATED",
            "Shipment updated successfully.",
            "Shipment updated successfully.",
            updated
        ));
    } catch (err) {
        if (err.message === "Shipment not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update shipment."));
    }
};

const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = statusChangeSchema.validate(req.body);
        if (error) {
            return res.status(400).json(errorResponse(
                "VALIDATION_ERROR",
                error.details[0].message,
                error.details[0].message
            ));
        }

        const userId = req.user.user_id;
        const companyId = req.user.company_id;

        const reqInfo = {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"]
        };

        const updated = await shipmentService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "SHIPMENT_STATUS_CHANGED",
            "Shipment status updated successfully.",
            "Shipment status updated successfully.",
            updated
        ));
    } catch (err) {
        if (err.message === "Shipment not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update status."));
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;
        const companyId = req.user.company_id;

        const reqInfo = {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"]
        };

        await shipmentService.deleteShipment(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "SHIPMENT_DELETED",
            "Shipment deleted successfully.",
            "Shipment has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "Shipment not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete shipment."));
    }
};

module.exports = {
    create,
    list,
    getById,
    update,
    changeStatus,
    remove
};
