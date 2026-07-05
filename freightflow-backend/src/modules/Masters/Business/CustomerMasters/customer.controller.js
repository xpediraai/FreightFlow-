/**
 * @file customer.controller.js
 * @description HTTP layer for Customer APIs.
 */
const { 
    createCustomerSchema, 
    updateCustomerSchema, 
    statusChangeSchema, 
    querySchema 
} = require("./customer.validators");
const customerService = require("./customer.service");
const { successResponse, errorResponse } = require("../../../../utils/response");

const create = async (req, res) => {
    try {
        const { error, value } = createCustomerSchema.validate(req.body);
        if (error) {
            return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
        }

        const userId = req.user.user_id;
        const companyId = req.user.company_id;

        if (!companyId) return res.status(401).json(errorResponse("UNAUTHORIZED", "Company ID missing.", "Unauthorized."));

        const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
        const newRecord = await customerService.createCustomer(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse("CUSTOMER_CREATED", "Customer created successfully.", "Created.", newRecord));
    } catch (err) {
        if (err.message.includes("unique within the company")) {
            return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        }
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create."));
    }
};

const list = async (req, res) => {
    try {
        const { error, value } = querySchema.validate(req.query);
        if (error) return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));

        const data = await customerService.getCustomers(req.user.company_id, value);
        return res.status(200).json(successResponse("CUSTOMERS_FETCHED", "Customers fetched successfully.", "Retrieved.", data));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch."));
    }
};

const getById = async (req, res) => {
    try {
        const record = await customerService.getCustomerById(req.user.company_id, req.params.id);
        return res.status(200).json(successResponse("CUSTOMER_FETCHED", "Customer fetched successfully.", "Retrieved.", record));
    } catch (err) {
        if (err.message === "Customer not found.") return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch."));
    }
};

const update = async (req, res) => {
    try {
        const { error, value } = updateCustomerSchema.validate(req.body);
        if (error) return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));

        const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
        const record = await customerService.updateCustomer(req.user.company_id, req.params.id, value, req.user.user_id, reqInfo);

        return res.status(200).json(successResponse("CUSTOMER_UPDATED", "Customer updated successfully.", "Updated.", record));
    } catch (err) {
        if (err.message === "Customer not found.") return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        if (err.message.includes("unique within the company")) return res.status(409).json(errorResponse("CONFLICT", err.message, err.message));
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update."));
    }
};

const changeStatus = async (req, res) => {
    try {
        const { error, value } = statusChangeSchema.validate(req.body);
        if (error) return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));

        const record = await customerService.changeStatus(req.user.company_id, req.params.id, value.status, req.user.user_id, {});
        return res.status(200).json(successResponse("STATUS_CHANGED", "Status changed successfully.", "Updated.", record));
    } catch (err) {
        if (err.message === "Customer not found.") return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to change status."));
    }
};

const remove = async (req, res) => {
    try {
        await customerService.deleteCustomer(req.user.company_id, req.params.id, req.user.user_id, {});
        return res.status(200).json(successResponse("CUSTOMER_DELETED", "Customer deleted successfully.", "Deleted.", null));
    } catch (err) {
        if (err.message === "Customer not found.") return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete."));
    }
};

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json(errorResponse("VALIDATION_ERROR", "No file uploaded.", "Please provide a file."));
        }
        // Normalize path for frontend consumption
        const fileUrl = `/uploads/Customers/${req.user.company_id}/${req.file.fieldname}/${req.file.filename}`;
        return res.status(200).json(successResponse("FILE_UPLOADED", "File uploaded successfully.", "Uploaded.", { file_url: fileUrl }));
    } catch (err) {
        return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to upload document."));
    }
};

module.exports = { create, list, getById, update, changeStatus, remove, uploadDocument };
