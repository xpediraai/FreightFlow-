/**
 * @file containerType.controller.js
 * @description HTTP layer for Container Type APIs.
 */
const { 
    createContainerTypeSchema, 
    updateContainerTypeSchema, 
    statusChangeSchema, 
    querySchema 
} = require("./containerType.validators");
const containerTypeService = require("./containerType.service");
const { successResponse, errorResponse } = require("../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createContainerTypeSchema.validate(req.body);
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

        const newRecord = await containerTypeService.createContainerType(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "CONTAINER_TYPE_CREATED",
            "Container Type created successfully.",
            "Container Type created successfully.",
            newRecord
        ));
    } catch (err) {
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create container type."));
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

        const data = await containerTypeService.getContainerTypes(companyId, value);

        return res.status(200).json(successResponse(
            "CONTAINER_TYPES_FETCHED",
            "Container Types fetched successfully.",
            "Container Types retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch container types."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const record = await containerTypeService.getContainerTypeById(companyId, id);

        return res.status(200).json(successResponse(
            "CONTAINER_TYPE_FETCHED",
            "Container Type fetched successfully.",
            "Container Type retrieved.",
            record
        ));
    } catch (err) {
        if (err.message === "Container Type not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch container type."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateContainerTypeSchema.validate(req.body);
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

        const updatedRecord = await containerTypeService.updateContainerType(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "CONTAINER_TYPE_UPDATED",
            "Container Type updated successfully.",
            "Container Type updated successfully.",
            updatedRecord
        ));
    } catch (err) {
        if (err.message === "Container Type not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update container type."));
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

        const updatedRecord = await containerTypeService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "CONTAINER_TYPE_STATUS_CHANGED",
            "Container Type status updated successfully.",
            "Container Type status updated successfully.",
            updatedRecord
        ));
    } catch (err) {
        if (err.message === "Container Type not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update container type status."));
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

        await containerTypeService.deleteContainerType(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "CONTAINER_TYPE_DELETED",
            "Container Type deleted successfully.",
            "Container Type has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "Container Type not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete container type."));
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
