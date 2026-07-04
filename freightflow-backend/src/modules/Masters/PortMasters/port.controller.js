/**
 * @file port.controller.js
 * @description HTTP layer for Port APIs.
 */
const { 
    createPortSchema, 
    updatePortSchema, 
    statusChangeSchema, 
    querySchema 
} = require("./port.validators");
const portService = require("./port.service");
const { successResponse, errorResponse } = require("../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createPortSchema.validate(req.body);
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

        const newPort = await portService.createPort(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "PORT_CREATED",
            "Port created successfully.",
            "Port created successfully.",
            newPort
        ));
    } catch (err) {
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        if (err.message.includes("Invalid") || err.message.includes("does not belong") || err.message.includes("required")) {
            return res.status(400).json(errorResponse("BAD_REQUEST", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create port."));
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

        const data = await portService.getPorts(companyId, value);

        return res.status(200).json(successResponse(
            "PORTS_FETCHED",
            "Ports fetched successfully.",
            "Ports retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch ports."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const port = await portService.getPortById(companyId, id);

        return res.status(200).json(successResponse(
            "PORT_FETCHED",
            "Port fetched successfully.",
            "Port retrieved.",
            port
        ));
    } catch (err) {
        if (err.message === "Port not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch port."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updatePortSchema.validate(req.body);
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

        const updatedPort = await portService.updatePort(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "PORT_UPDATED",
            "Port updated successfully.",
            "Port updated successfully.",
            updatedPort
        ));
    } catch (err) {
        if (err.message === "Port not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        if (err.message.includes("Invalid") || err.message.includes("does not belong") || err.message.includes("required")) {
            return res.status(400).json(errorResponse("BAD_REQUEST", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update port."));
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

        const updatedPort = await portService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "PORT_STATUS_CHANGED",
            "Port status updated successfully.",
            "Port status updated successfully.",
            updatedPort
        ));
    } catch (err) {
        if (err.message === "Port not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update port status."));
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

        await portService.deletePort(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "PORT_DELETED",
            "Port deleted successfully.",
            "Port has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "Port not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete port."));
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
