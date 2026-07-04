/**
 * @file transportMode.routes.js
 * @description Express routes for Transport Mode APIs.
 */
const express = require("express");
const router = express.Router();
const transportModeController = require("./transportMode.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

// Protect all routes
router.use(authenticateToken);

// Create
router.post("/", transportModeController.create);

// List
router.get("/", transportModeController.list);

// Get by ID
router.get("/:id", transportModeController.getById);

// Update
router.put("/:id", transportModeController.update);

// Change Status
router.patch("/:id/status", transportModeController.changeStatus);

// Soft Delete
router.delete("/:id", transportModeController.remove);

module.exports = router;
