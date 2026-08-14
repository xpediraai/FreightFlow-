/**
 * @file tracking.routes.js
 * @description Express routes for Shipment Tracking endpoints.
 */
const express = require("express");
const router = express.Router();
const trackingController = require("./tracking.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

// Live Multi-Source Preview
router.post("/fetch", authenticateToken, trackingController.fetchLiveTracking);

// Confirmation & Activation
router.post("/confirm", authenticateToken, trackingController.confirmTracking);

// List Monitored Shipments
router.get("/", authenticateToken, trackingController.getTrackedShipments);

// Single Tracking Details
router.get("/:id", authenticateToken, trackingController.getTrackingById);

// Manual Re-Scan / Refresh
router.post("/:id/refresh", authenticateToken, trackingController.refreshShipmentTracking);

// Status / Milestone Manual Override
router.patch("/:id/override", authenticateToken, trackingController.overrideTrackingStatus);

module.exports = router;
