/**
 * @file commodity.routes.js
 * @description Express routes for Commodity APIs.
 */
const express = require("express");
const router = express.Router();
const commodityController = require("./commodity.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

// Protect all routes
router.use(authenticateToken);

// Create
router.post("/", commodityController.create);

// List
router.get("/", commodityController.list);

// Get by ID
router.get("/:id", commodityController.getById);

// Update
router.put("/:id", commodityController.update);

// Change Status
router.patch("/:id/status", commodityController.changeStatus);

// Soft Delete
router.delete("/:id", commodityController.remove);

module.exports = router;
