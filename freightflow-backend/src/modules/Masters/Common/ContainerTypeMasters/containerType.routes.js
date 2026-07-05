/**
 * @file containerType.routes.js
 * @description Express routes for Container Type APIs.
 */
const express = require("express");
const router = express.Router();
const containerTypeController = require("./containerType.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

// Protect all routes
router.use(authenticateToken);

// Create
router.post("/", containerTypeController.create);

// List
router.get("/", containerTypeController.list);

// Get by ID
router.get("/:id", containerTypeController.getById);

// Update
router.put("/:id", containerTypeController.update);

// Change Status
router.patch("/:id/status", containerTypeController.changeStatus);

// Soft Delete
router.delete("/:id", containerTypeController.remove);

module.exports = router;
