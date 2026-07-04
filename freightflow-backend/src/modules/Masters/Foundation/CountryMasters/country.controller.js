/**
 * @file country.controller.js
 * @description HTTP layer for Country APIs.
 */
const { 
    createCountrySchema, 
    updateCountrySchema, 
    statusChangeSchema, 
    querySchema 
} = require("./country.validators");
const countryService = require("./country.service");
const { successResponse, errorResponse } = require("../../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createCountrySchema.validate(req.body);
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

        const newCountry = await countryService.createCountry(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "COUNTRY_CREATED",
            "Country created successfully.",
            "Country created successfully.",
            newCountry
        ));
    } catch (err) {
        if (err.message === "Country Code must be unique within the company.") {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create country."));
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

        const data = await countryService.getCountries(companyId, value);

        return res.status(200).json(successResponse(
            "COUNTRIES_FETCHED",
            "Countries fetched successfully.",
            "Countries retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch countries."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const country = await countryService.getCountryById(companyId, id);

        return res.status(200).json(successResponse(
            "COUNTRY_FETCHED",
            "Country fetched successfully.",
            "Country retrieved.",
            country
        ));
    } catch (err) {
        if (err.message === "Country not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch country."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateCountrySchema.validate(req.body);
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

        const updatedCountry = await countryService.updateCountry(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "COUNTRY_UPDATED",
            "Country updated successfully.",
            "Country updated successfully.",
            updatedCountry
        ));
    } catch (err) {
        if (err.message === "Country not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        if (err.message === "Country Code must be unique within the company.") {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update country."));
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

        const updatedCountry = await countryService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "COUNTRY_STATUS_CHANGED",
            "Country status updated successfully.",
            "Country status updated successfully.",
            updatedCountry
        ));
    } catch (err) {
        if (err.message === "Country not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update country status."));
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

        await countryService.deleteCountry(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "COUNTRY_DELETED",
            "Country deleted successfully.",
            "Country has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "Country not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete country."));
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
