/**
 * @file packageType.controller.js
 * @description HTTP layer for Package Type Master APIs.
 */
const { 
    createPackageTypeSchema, 
    updatePackageTypeSchema, 
    statusChangeSchema, 
    querySchema 
} = require("./packageType.validators");
const packageTypeService = require("./packageType.service");
const { successResponse, errorResponse } = require("../../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createPackageTypeSchema.validate(req.body);
        if (error) return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));

        const userId = req.user.user_id;
        const companyId = req.user.company_id;
        if (!companyId) return res.status(401).json(errorResponse("UNAUTHORIZED", "Company ID missing.", "Unauthorized."));

        const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
        const newRecord = await packageTypeService.createPackageType(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse("PACKAGE_TYPE_CREATED", "Package Type created successfully.", "Created.", newRecord));
    } catch (err) {
        if (err.message.includes("unique within the company")) return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create."));
    }
};

const list = async (req, res) => {
    try {
        const { error, value } = querySchema.validate(req.query);
        if (error) return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));

        const data = await packageTypeService.getPackageTypes(req.user.company_id, value);
        return res.status(200).json(successResponse("PACKAGE_TYPES_FETCHED", "Package Types fetched successfully.", "Retrieved.", data));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch."));
    }
};

const getById = async (req, res) => {
    try {
        const record = await packageTypeService.getPackageTypeById(req.user.company_id, req.params.id);
        return res.status(200).json(successResponse("PACKAGE_TYPE_FETCHED", "Package Type fetched successfully.", "Retrieved.", record));
    } catch (err) {
        if (err.message === "Package Type not found.") return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch."));
    }
};

const update = async (req, res) => {
    try {
        const { error, value } = updatePackageTypeSchema.validate(req.body);
        if (error) return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));

        const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
        const record = await packageTypeService.updatePackageType(req.user.company_id, req.params.id, value, req.user.user_id, reqInfo);

        return res.status(200).json(successResponse("PACKAGE_TYPE_UPDATED", "Package Type updated successfully.", "Updated.", record));
    } catch (err) {
        if (err.message === "Package Type not found.") return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        if (err.message.includes("unique within the company")) return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update."));
    }
};

const changeStatus = async (req, res) => {
    try {
        const { error, value } = statusChangeSchema.validate(req.body);
        if (error) return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));

        const record = await packageTypeService.changeStatus(req.user.company_id, req.params.id, value.status, req.user.user_id);
        return res.status(200).json(successResponse("STATUS_CHANGED", "Status changed successfully.", "Updated.", record));
    } catch (err) {
        if (err.message === "Package Type not found.") return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to change status."));
    }
};

const remove = async (req, res) => {
    try {
        await packageTypeService.deletePackageType(req.user.company_id, req.params.id);
        return res.status(200).json(successResponse("PACKAGE_TYPE_DELETED", "Package Type deleted successfully.", "Deleted.", null));
    } catch (err) {
        if (err.message === "Package Type not found.") return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete."));
    }
};

module.exports = { create, list, getById, update, changeStatus, remove };
