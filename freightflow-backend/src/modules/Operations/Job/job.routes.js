/**
 * @file job.routes.js
 * @description Express routes for Job APIs.
 */
const express = require("express");
const router = express.Router();
const jobController = require("./job.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

// Protect all routes
router.use(authenticateToken);

// Create Job
router.post("/", jobController.create);

// List Jobs
router.get("/", jobController.list);

// Get Job by ID
router.get("/:id", jobController.getById);

// Update Job
router.put("/:id", jobController.update);

// Change Job Status
router.patch("/:id/status", jobController.changeStatus);

// Soft Delete Job
router.delete("/:id", jobController.remove);

module.exports = router;
