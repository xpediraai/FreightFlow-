/**
 * @file port.routes.js
 * @description Express routes for Port APIs.
 */
const express = require("express");
const router = express.Router();
const portController = require("./port.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

// Protect all port routes
router.use(authenticateToken);

// Create Port
router.post("/", portController.create);

// List Ports
router.get("/", portController.list);

// Get Port by ID
router.get("/:id", portController.getById);

// Update Port
router.put("/:id", portController.update);

// Change Port Status
router.patch("/:id/status", portController.changeStatus);

// Soft Delete Port
router.delete("/:id", portController.remove);

module.exports = router;
