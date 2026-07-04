/**
 * @file commodity.controller.js
 * @description HTTP layer for Commodity APIs.
 */
const { 
    createCommoditySchema, 
    updateCommoditySchema, 
    statusChangeSchema, 
    querySchema 
} = require("./commodity.validators");
const commodityService = require("./commodity.service");
const { successResponse, errorResponse } = require("../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createCommoditySchema.validate(req.body);
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

        const newRecord = await commodityService.createCommodity(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "COMMODITY_CREATED",
            "Commodity created successfully.",
            "Commodity created successfully.",
            newRecord
        ));
    } catch (err) {
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create commodity."));
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

        const data = await commodityService.getCommodities(companyId, value);

        return res.status(200).json(successResponse(
            "COMMODITIES_FETCHED",
            "Commodities fetched successfully.",
            "Commodities retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch commodities."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const record = await commodityService.getCommodityById(companyId, id);

        return res.status(200).json(successResponse(
            "COMMODITY_FETCHED",
            "Commodity fetched successfully.",
            "Commodity retrieved.",
            record
        ));
    } catch (err) {
        if (err.message === "Commodity not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch commodity."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateCommoditySchema.validate(req.body);
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

        const updatedRecord = await commodityService.updateCommodity(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "COMMODITY_UPDATED",
            "Commodity updated successfully.",
            "Commodity updated successfully.",
            updatedRecord
        ));
    } catch (err) {
        if (err.message === "Commodity not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update commodity."));
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

        const updatedRecord = await commodityService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "COMMODITY_STATUS_CHANGED",
            "Commodity status updated successfully.",
            "Commodity status updated successfully.",
            updatedRecord
        ));
    } catch (err) {
        if (err.message === "Commodity not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update commodity status."));
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

        await commodityService.deleteCommodity(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "COMMODITY_DELETED",
            "Commodity deleted successfully.",
            "Commodity has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "Commodity not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete commodity."));
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
