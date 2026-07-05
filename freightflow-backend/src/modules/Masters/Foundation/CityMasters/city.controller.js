/**
 * @file city.controller.js
 * @description HTTP layer for City APIs.
 */
const {
    createCitySchema,
    updateCitySchema,
    statusChangeSchema,
    querySchema
} = require("./city.validators");
const cityService = require("./city.service");
const { successResponse, errorResponse } = require("../../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createCitySchema.validate(req.body);
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

        const newCity = await cityService.createCity(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "CITY_CREATED",
            "City created successfully.",
            "City created successfully.",
            newCity
        ));
    } catch (err) {
        if (err.message.includes("unique within the selected state")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        if (err.message.includes("Invalid State ID") || err.message.includes("does not belong") || err.message.includes("Invalid Country ID")) {
            return res.status(400).json(errorResponse("BAD_REQUEST", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create city."));
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

        const data = await cityService.getCities(companyId, value);

        return res.status(200).json(successResponse(
            "CITIES_FETCHED",
            "Cities fetched successfully.",
            "Cities retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch cities."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const city = await cityService.getCityById(companyId, id);

        return res.status(200).json(successResponse(
            "CITY_FETCHED",
            "City fetched successfully.",
            "City retrieved.",
            city
        ));
    } catch (err) {
        if (err.message === "City not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch city."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateCitySchema.validate(req.body);
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

        const updatedCity = await cityService.updateCity(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "CITY_UPDATED",
            "City updated successfully.",
            "City updated successfully.",
            updatedCity
        ));
    } catch (err) {
        if (err.message === "City not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        if (err.message.includes("unique within the selected state")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        if (err.message.includes("Invalid State ID") || err.message.includes("does not belong") || err.message.includes("Invalid Country ID")) {
            return res.status(400).json(errorResponse("BAD_REQUEST", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update city."));
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

        const updatedCity = await cityService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "CITY_STATUS_CHANGED",
            "City status updated successfully.",
            "City status updated successfully.",
            updatedCity
        ));
    } catch (err) {
        if (err.message === "City not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update city status."));
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

        await cityService.deleteCity(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "CITY_DELETED",
            "City deleted successfully.",
            "City has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "City not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete city."));
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
