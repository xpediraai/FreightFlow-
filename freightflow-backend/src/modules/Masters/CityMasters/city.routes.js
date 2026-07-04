/**
 * @file city.routes.js
 * @description Express routes for City APIs.
 */
const express = require("express");
const router = express.Router();
const cityController = require("./city.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

// Protect all city routes
router.use(authenticateToken);

// Create City
router.post("/", cityController.create);

// List Cities
router.get("/", cityController.list);

// Get City by ID
router.get("/:id", cityController.getById);

// Update City
router.put("/:id", cityController.update);

// Change City Status
router.patch("/:id/status", cityController.changeStatus);

// Soft Delete City
router.delete("/:id", cityController.remove);

module.exports = router;
