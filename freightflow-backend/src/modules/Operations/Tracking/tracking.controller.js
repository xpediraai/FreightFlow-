/**
 * @file tracking.controller.js
 * @description Controller handling incoming API requests for multi-source tracking.
 */
const trackingService = require("./Services/tracking.service");
const { fetchTrackingSchema, confirmTrackingSchema, overrideStatusSchema } = require("./tracking.validators");
const { successResponse, errorResponse } = require("../../../utils/response");

/**
 * Live multi-source fetch preview
 * POST /api/tracking/fetch
 */
const fetchLiveTracking = async (req, res) => {
    try {
        const { error, value } = fetchTrackingSchema.validate(req.body);
        if (error) {
            return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
        }

        const result = await trackingService.fetchLiveTracking(value.shipping_line_name, value.bl_number);

        return res.status(200).json(successResponse(
            "TRACKING_FETCHED",
            "Multi-source tracking data fetched successfully.",
            "Multi-source tracking data fetched successfully.",
            result
        ));
    } catch (err) {
        return res.status(500).json(errorResponse(
            "FETCH_TRACKING_FAILED",
            err.message,
            "Failed to fetch tracking data from external sources. Please try again."
        ));
    }
};

/**
 * Confirm and activate automated tracking
 * POST /api/tracking/confirm
 */
const confirmTracking = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.user_id || req.user.id;

        const { error, value } = confirmTrackingSchema.validate(req.body);
        if (error) {
            return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
        }

        const reqInfo = {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"]
        };

        const result = await trackingService.confirmTracking(companyId, value, userId, reqInfo);

        return res.status(201).json(successResponse(
            "TRACKING_CONFIRMED",
            "Shipment tracking confirmed and active monitoring started.",
            "Shipment tracking confirmed and active monitoring started.",
            result
        ));
    } catch (err) {
        return res.status(500).json(errorResponse(
            "CONFIRM_TRACKING_FAILED",
            err.message,
            "An error occurred while confirming tracking."
        ));
    }
};

/**
 * Get all monitored shipments
 * GET /api/tracking
 */
const getTrackedShipments = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { page, limit, search, status, tracking_mode } = req.query;

        const result = await trackingService.getTrackedShipments(companyId, {
            page,
            limit,
            search,
            status,
            tracking_mode
        });

        return res.status(200).json(successResponse(
            "TRACKED_SHIPMENTS_FETCHED",
            "Tracked shipments retrieved successfully.",
            "Tracked shipments retrieved successfully.",
            result
        ));
    } catch (err) {
        return res.status(500).json(errorResponse(
            "FETCH_TRACKED_SHIPMENTS_FAILED",
            err.message,
            "Failed to retrieve tracked shipments."
        ));
    }
};

/**
 * Get single tracking by ID
 * GET /api/tracking/:id
 */
const getTrackingById = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;

        const result = await trackingService.getTrackingById(companyId, id);

        return res.status(200).json(successResponse(
            "TRACKING_DETAILS_FETCHED",
            "Tracking details retrieved successfully.",
            "Tracking details retrieved successfully.",
            result
        ));
    } catch (err) {
        return res.status(404).json(errorResponse(
            "TRACKING_NOT_FOUND",
            err.message,
            "Tracking record not found."
        ));
    }
};

/**
 * Refresh tracking by ID
 * POST /api/tracking/:id/refresh
 */
const refreshShipmentTracking = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.user_id || req.user.id;
        const { id } = req.params;

        const result = await trackingService.refreshShipmentTracking(companyId, id, userId);

        return res.status(200).json(successResponse(
            "TRACKING_REFRESHED",
            "Tracking data re-scanned and updated successfully.",
            "Tracking data re-scanned and updated successfully.",
            result
        ));
    } catch (err) {
        return res.status(500).json(errorResponse(
            "REFRESH_TRACKING_FAILED",
            err.message,
            "Failed to refresh tracking data."
        ));
    }
};

/**
 * Manual override status
 * PATCH /api/tracking/:id/override
 */
const overrideTrackingStatus = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.user_id || req.user.id;
        const { id } = req.params;

        const { error, value } = overrideStatusSchema.validate(req.body);
        if (error) {
            return res.status(400).json(errorResponse("VALIDATION_ERROR", error.details[0].message, error.details[0].message));
        }

        const result = await trackingService.overrideTrackingStatus(companyId, id, value, userId);

        return res.status(200).json(successResponse(
            "STATUS_OVERRIDDEN",
            "Shipment tracking status updated successfully.",
            "Shipment tracking status updated successfully.",
            result
        ));
    } catch (err) {
        return res.status(500).json(errorResponse(
            "OVERRIDE_FAILED",
            err.message,
            "Failed to update tracking status."
        ));
    }
};

module.exports = {
    fetchLiveTracking,
    confirmTracking,
    getTrackedShipments,
    getTrackingById,
    refreshShipmentTracking,
    overrideTrackingStatus
};
