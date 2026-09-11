/**
 * @file shippingInquiry.controller.js
 * @description HTTP controller for Export Shipping Inquiry endpoints.
 */
const {
  createShippingInquirySchema,
  updateShippingInquirySchema,
  statusChangeSchema,
  querySchema,
} = require("./shippingInquiry.validators");
const shippingInquiryService = require("./shippingInquiry.service");
const { successResponse, errorResponse } = require("../../../utils/response");

const create = async (req, res) => {
  try {
    const { error, value } = createShippingInquirySchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
    }

    const userId = req.user?.user_id || req.user?.id || null;
    const companyId = req.user?.company_id || null;

    const newRecord = await shippingInquiryService.createShippingInquiry(companyId, value, userId);

    return res.status(201).json(successResponse("SHIPPING_INQUIRY_CREATED", "Shipping Inquiry created successfully.", "Created.", newRecord));
  } catch (err) {
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to create Shipping Inquiry."));
  }
};

const list = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
    }

    const companyId = req.user?.company_id || null;
    const data = await shippingInquiryService.getShippingInquiries(companyId, value);

    return res.status(200).json(successResponse("SHIPPING_INQUIRIES_FETCHED", "Shipping Inquiries fetched successfully.", "Retrieved.", data));
  } catch (err) {
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch Shipping Inquiries."));
  }
};

const getById = async (req, res) => {
  try {
    const record = await shippingInquiryService.getShippingInquiryById(req.params.id);
    return res.status(200).json(successResponse("SHIPPING_INQUIRY_FETCHED", "Shipping Inquiry fetched successfully.", "Retrieved.", record));
  } catch (err) {
    if (err.message === "Shipping Inquiry not found") {
      return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
    }
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to fetch Shipping Inquiry."));
  }
};

const update = async (req, res) => {
  try {
    const { error, value } = updateShippingInquirySchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
    }

    const userId = req.user?.user_id || req.user?.id || null;
    const companyId = req.user?.company_id || null;

    const updatedRecord = await shippingInquiryService.updateShippingInquiry(req.params.id, companyId, value, userId);

    return res.status(200).json(successResponse("SHIPPING_INQUIRY_UPDATED", "Shipping Inquiry updated successfully.", "Updated.", updatedRecord));
  } catch (err) {
    if (err.message === "Shipping Inquiry not found") {
      return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
    }
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to update Shipping Inquiry."));
  }
};

const remove = async (req, res) => {
  try {
    const result = await shippingInquiryService.deleteShippingInquiry(req.params.id);
    return res.status(200).json(successResponse("SHIPPING_INQUIRY_DELETED", "Shipping Inquiry deleted successfully.", "Deleted.", result));
  } catch (err) {
    if (err.message === "Shipping Inquiry not found") {
      return res.status(404).json(errorResponse("NOT_FOUND", err.message, err.message));
    }
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", err.message, "Failed to delete Shipping Inquiry."));
  }
};

const changeStatus = async (req, res) => {
  try {
    const { error, value } = statusChangeSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
    }

    const userId = req.user?.user_id || req.user?.id || null;
    const updatedRecord = await shippingInquiryService.changeStatus(req.params.id, value.status, userId);

    return res.status(200).json(successResponse("STATUS_UPDATED", "Shipping Inquiry status updated successfully.", "Updated.", updatedRecord));
  } catch (err) {
    if (err.message === "Shipping Inquiry not found") {
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
