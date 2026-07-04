/**
 * @file shippingLine.controller.js
 * @description HTTP layer for Shipping Line APIs.
 */
const { 
    createShippingLineSchema, 
    updateShippingLineSchema, 
    statusChangeSchema, 
    querySchema 
} = require("./shippingLine.validators");
const shippingLineService = require("./shippingLine.service");
const { successResponse, errorResponse } = require("../../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createShippingLineSchema.validate(req.body);
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

        const newRecord = await shippingLineService.createShippingLine(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "SHIPPING_LINE_CREATED",
            "Shipping Line created successfully.",
            "Shipping Line created successfully.",
            newRecord
        ));
    } catch (err) {
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        if (err.message.includes("Invalid") || err.message.includes("does not belong")) {
            return res.status(400).json(errorResponse("BAD_REQUEST", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create shipping line."));
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

        const data = await shippingLineService.getShippingLines(companyId, value);

        return res.status(200).json(successResponse(
            "SHIPPING_LINES_FETCHED",
            "Shipping Lines fetched successfully.",
            "Shipping Lines retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch shipping lines."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const record = await shippingLineService.getShippingLineById(companyId, id);

        return res.status(200).json(successResponse(
            "SHIPPING_LINE_FETCHED",
            "Shipping Line fetched successfully.",
            "Shipping Line retrieved.",
            record
        ));
    } catch (err) {
        if (err.message === "Shipping Line not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch shipping line."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateShippingLineSchema.validate(req.body);
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

        const updatedRecord = await shippingLineService.updateShippingLine(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "SHIPPING_LINE_UPDATED",
            "Shipping Line updated successfully.",
            "Shipping Line updated successfully.",
            updatedRecord
        ));
    } catch (err) {
        if (err.message === "Shipping Line not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        if (err.message.includes("Invalid") || err.message.includes("does not belong")) {
            return res.status(400).json(errorResponse("BAD_REQUEST", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update shipping line."));
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

        const updatedRecord = await shippingLineService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "SHIPPING_LINE_STATUS_CHANGED",
            "Shipping Line status updated successfully.",
            "Shipping Line status updated successfully.",
            updatedRecord
        ));
    } catch (err) {
        if (err.message === "Shipping Line not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update shipping line status."));
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

        await shippingLineService.deleteShippingLine(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "SHIPPING_LINE_DELETED",
            "Shipping Line deleted successfully.",
            "Shipping Line has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "Shipping Line not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete shipping line."));
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
