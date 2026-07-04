/**
 * @file currency.routes.js
 * @description Express routes for Currency APIs.
 */
const express = require("express");
const router = express.Router();
const currencyController = require("./currency.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

// Protect all currency routes
router.use(authenticateToken);

// Create Currency
router.post("/", currencyController.create);

// List Currencies (with pagination, search, sort, filter)
router.get("/", currencyController.list);

// Get Currency by ID
router.get("/:id", currencyController.getById);

// Update Currency
router.put("/:id", currencyController.update);

// Change Currency Status
router.patch("/:id/status", currencyController.changeStatus);

// Soft Delete Currency
router.delete("/:id", currencyController.remove);

module.exports = router;
