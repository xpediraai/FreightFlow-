/**
 * @file currency.controller.js
 * @description HTTP layer for Currency APIs.
 */
const { 
    createCurrencySchema, 
    updateCurrencySchema, 
    statusChangeSchema, 
    querySchema 
} = require("./currency.validators");
const currencyService = require("./currency.service");
const { successResponse, errorResponse } = require("../../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createCurrencySchema.validate(req.body);
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

        const newCurrency = await currencyService.createCurrency(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "CURRENCY_CREATED",
            "Currency created successfully.",
            "Currency created successfully.",
            newCurrency
        ));
    } catch (err) {
        if (err.message === "Currency Code must be unique within the company.") {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create currency."));
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

        const data = await currencyService.getCurrencies(companyId, value);

        return res.status(200).json(successResponse(
            "CURRENCIES_FETCHED",
            "Currencies fetched successfully.",
            "Currencies retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch currencies."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const currency = await currencyService.getCurrencyById(companyId, id);

        return res.status(200).json(successResponse(
            "CURRENCY_FETCHED",
            "Currency fetched successfully.",
            "Currency retrieved.",
            currency
        ));
    } catch (err) {
        if (err.message === "Currency not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch currency."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateCurrencySchema.validate(req.body);
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

        const updatedCurrency = await currencyService.updateCurrency(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "CURRENCY_UPDATED",
            "Currency updated successfully.",
            "Currency updated successfully.",
            updatedCurrency
        ));
    } catch (err) {
        if (err.message === "Currency not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        if (err.message === "Currency Code must be unique within the company.") {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update currency."));
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

        const updatedCurrency = await currencyService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "CURRENCY_STATUS_CHANGED",
            "Currency status updated successfully.",
            "Currency status updated successfully.",
            updatedCurrency
        ));
    } catch (err) {
        if (err.message === "Currency not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update currency status."));
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

        await currencyService.deleteCurrency(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "CURRENCY_DELETED",
            "Currency deleted successfully.",
            "Currency has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "Currency not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete currency."));
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
