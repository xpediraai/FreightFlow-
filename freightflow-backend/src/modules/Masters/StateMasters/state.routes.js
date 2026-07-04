/**
 * @file state.routes.js
 * @description Express routes for State APIs.
 */
const express = require("express");
const router = express.Router();
const stateController = require("./state.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

// Protect all state routes
router.use(authenticateToken);

// Create State
router.post("/", stateController.create);

// List States (with pagination, search, sort, filter, country_id filter)
router.get("/", stateController.list);

// Get State by ID
router.get("/:id", stateController.getById);

// Update State
router.put("/:id", stateController.update);

// Change State Status
router.patch("/:id/status", stateController.changeStatus);

// Soft Delete State
router.delete("/:id", stateController.remove);

module.exports = router;
