/**
 * @file country.routes.js
 * @description Express routes for Country APIs.
 */
const express = require("express");
const router = express.Router();
const countryController = require("./country.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

// Protect all country routes
router.use(authenticateToken);

// Create Country
router.post("/", countryController.create);

// List Countries (with pagination, search, sort, filter)
router.get("/", countryController.list);

// Get Country by ID
router.get("/:id", countryController.getById);

// Update Country
router.put("/:id", countryController.update);

// Change Country Status
router.patch("/:id/status", countryController.changeStatus);

// Soft Delete Country
router.delete("/:id", countryController.remove);

module.exports = router;
