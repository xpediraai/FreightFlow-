/**
 * @file state.controller.js
 * @description HTTP layer for State APIs.
 */
const { 
    createStateSchema, 
    updateStateSchema, 
    statusChangeSchema, 
    querySchema 
} = require("./state.validators");
const stateService = require("./state.service");
const { successResponse, errorResponse } = require("../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createStateSchema.validate(req.body);
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

        const newState = await stateService.createState(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "STATE_CREATED",
            "State created successfully.",
            "State created successfully.",
            newState
        ));
    } catch (err) {
        if (err.message.includes("unique within the selected country")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        if (err.message.includes("Invalid Country ID")) {
            return res.status(400).json(errorResponse("BAD_REQUEST", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create state."));
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

        const data = await stateService.getStates(companyId, value);

        return res.status(200).json(successResponse(
            "STATES_FETCHED",
            "States fetched successfully.",
            "States retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch states."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const state = await stateService.getStateById(companyId, id);

        return res.status(200).json(successResponse(
            "STATE_FETCHED",
            "State fetched successfully.",
            "State retrieved.",
            state
        ));
    } catch (err) {
        if (err.message === "State not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch state."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateStateSchema.validate(req.body);
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

        const updatedState = await stateService.updateState(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "STATE_UPDATED",
            "State updated successfully.",
            "State updated successfully.",
            updatedState
        ));
    } catch (err) {
        if (err.message === "State not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        if (err.message.includes("unique within the selected country")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        if (err.message.includes("Invalid Country ID")) {
            return res.status(400).json(errorResponse("BAD_REQUEST", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update state."));
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

        const updatedState = await stateService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "STATE_STATUS_CHANGED",
            "State status updated successfully.",
            "State status updated successfully.",
            updatedState
        ));
    } catch (err) {
        if (err.message === "State not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update state status."));
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

        await stateService.deleteState(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "STATE_DELETED",
            "State deleted successfully.",
            "State has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "State not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete state."));
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
