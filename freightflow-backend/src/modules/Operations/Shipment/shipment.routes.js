/**
 * @file shipment.routes.js
 * @description Express routes for Shipment APIs.
 */
const express = require("express");
const router = express.Router();
const shipmentController = require("./shipment.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

// Protect all routes
router.use(authenticateToken);

// Create Shipment
router.post("/", shipmentController.create);

// List Shipments
router.get("/", shipmentController.list);

// Get Shipment by ID
router.get("/:id", shipmentController.getById);

// Update Shipment
router.put("/:id", shipmentController.update);

// Change Shipment Status
router.patch("/:id/status", shipmentController.changeStatus);

// Soft Delete Shipment
router.delete("/:id", shipmentController.remove);

module.exports = router;
