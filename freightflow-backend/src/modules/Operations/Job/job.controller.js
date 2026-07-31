/**
 * @file job.controller.js
 * @description HTTP layer for Job APIs.
 */
const { 
    createJobSchema, 
    updateJobSchema, 
    statusChangeSchema, 
    querySchema 
} = require("./job.validators");
const jobService = require("./job.service");
const { successResponse, errorResponse } = require("../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createJobSchema.validate(req.body);
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

        const job = await jobService.createJob(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "JOB_CREATED",
            "Job created successfully.",
            "Job created successfully.",
            job
        ));
    } catch (err) {
        if (err.message.includes("already been created") || err.message.includes("unique")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        if (err.message.includes("Invalid")) {
            return res.status(400).json(errorResponse("BAD_REQUEST", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create job."));
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

        const data = await jobService.getJobs(companyId, value);

        return res.status(200).json(successResponse(
            "JOBS_FETCHED",
            "Jobs fetched successfully.",
            "Jobs retrieved.",
            data
        ));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch jobs."));
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company_id;

        const job = await jobService.getJobById(companyId, id);

        return res.status(200).json(successResponse(
            "JOB_FETCHED",
            "Job fetched successfully.",
            "Job retrieved.",
            job
        ));
    } catch (err) {
        if (err.message === "Job not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch job."));
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateJobSchema.validate(req.body);
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

        const updated = await jobService.updateJob(companyId, id, value, userId, reqInfo);

        return res.status(200).json(successResponse(
            "JOB_UPDATED",
            "Job updated successfully.",
            "Job updated successfully.",
            updated
        ));
    } catch (err) {
        if (err.message === "Job not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update job."));
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

        const updated = await jobService.changeStatus(companyId, id, value.status, userId, reqInfo);

        return res.status(200).json(successResponse(
            "JOB_STATUS_CHANGED",
            "Job status updated successfully.",
            "Job status updated successfully.",
            updated
        ));
    } catch (err) {
        if (err.message === "Job not found.") {
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

        await jobService.deleteJob(companyId, id, userId, reqInfo);

        return res.status(200).json(successResponse(
            "JOB_DELETED",
            "Job deleted successfully.",
            "Job has been deleted.",
            null
        ));
    } catch (err) {
        if (err.message === "Job not found.") {
            return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete job."));
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
