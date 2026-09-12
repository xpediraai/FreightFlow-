/**
 * @file exportQuotation.controller.js
 * @description HTTP controller for Export Quotation endpoints.
 */
const {
  createExportQuotationSchema,
  updateExportQuotationSchema,
  statusChangeSchema,
  querySchema,
} = require("./exportQuotation.validators");
const exportQuotationService = require("./exportQuotation.service");
const { successResponse, errorResponse } = require("../../../utils/response");

const create = async (req, res) => {
  try {
    const { error, value } = createExportQuotationSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
    }

    const userId = req.user?.user_id || req.user?.id || null;
    const companyId = req.user?.company_id || null;

    const newRecord = await exportQuotationService.createExportQuotation(companyId, value, userId);

    return res.status(201).json(successResponse("EXPORT_QUOTATION_CREATED", "Export Quotation created successfully.", "Created.", newRecord));
  } catch (err) {
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create Export Quotation."));
  }
};

const list = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
    }

    const companyId = req.user?.company_id || null;
    const data = await exportQuotationService.getExportQuotations(companyId, value);

    return res.status(200).json(successResponse("EXPORT_QUOTATIONS_FETCHED", "Export Quotations fetched successfully.", "Retrieved.", data));
  } catch (err) {
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch Export Quotations."));
  }
};

const getById = async (req, res) => {
  try {
    const record = await exportQuotationService.getExportQuotationById(req.params.id);
    return res.status(200).json(successResponse("EXPORT_QUOTATION_FETCHED", "Export Quotation fetched successfully.", "Retrieved.", record));
  } catch (err) {
    if (err.message === "Export Quotation not found") {
      return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
    }
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch Export Quotation."));
  }
};

const update = async (req, res) => {
  try {
    const { error, value } = updateExportQuotationSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
    }

    const userId = req.user?.user_id || req.user?.id || null;
    const companyId = req.user?.company_id || null;

    const updatedRecord = await exportQuotationService.updateExportQuotation(req.params.id, companyId, value, userId);

    return res.status(200).json(successResponse("EXPORT_QUOTATION_UPDATED", "Export Quotation updated successfully.", "Updated.", updatedRecord));
  } catch (err) {
    if (err.message === "Export Quotation not found") {
      return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
    }
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update Export Quotation."));
  }
};

const remove = async (req, res) => {
  try {
    const result = await exportQuotationService.deleteExportQuotation(req.params.id);
    return res.status(200).json(successResponse("EXPORT_QUOTATION_DELETED", "Export Quotation deleted successfully.", "Deleted.", result));
  } catch (err) {
    if (err.message === "Export Quotation not found") {
      return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
    }
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete Export Quotation."));
  }
};

const changeStatus = async (req, res) => {
  try {
    const { error, value } = statusChangeSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
    }

    const userId = req.user?.user_id || req.user?.id || null;
    const updatedRecord = await exportQuotationService.changeStatus(req.params.id, value.status, userId);

    return res.status(200).json(successResponse("STATUS_UPDATED", "Export Quotation status updated successfully.", "Updated.", updatedRecord));
  } catch (err) {
    if (err.message === "Export Quotation not found") {
      return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
    }
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update status."));
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  changeStatus,
};
