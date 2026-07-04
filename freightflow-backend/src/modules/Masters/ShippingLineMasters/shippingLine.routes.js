/**
 * @file shippingLine.routes.js
 * @description Express routes for Shipping Line APIs.
 */
const express = require("express");
const router = express.Router();
const shippingLineController = require("./shippingLine.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

// Protect all routes
router.use(authenticateToken);

// Create
router.post("/", shippingLineController.create);

// List
router.get("/", shippingLineController.list);

// Get by ID
router.get("/:id", shippingLineController.getById);

// Update
router.put("/:id", shippingLineController.update);

// Change Status
router.patch("/:id/status", shippingLineController.changeStatus);

// Soft Delete
router.delete("/:id", shippingLineController.remove);

module.exports = router;
