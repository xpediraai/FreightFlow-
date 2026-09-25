/**
 * @file exportClearing.routes.js
 * @description Express routes for Export Clearing & ODEX API Integration.
 */

const express = require("express");
const router = express.Router();
const controller = require("./exportClearing.controller");
const { upload, handleUpload } = require("../../../middlewares/upload.middleware");

// ODEX Sync endpoint
router.post("/:id/odex-sync", controller.syncODEX);

// Document upload endpoint (using Multer middleware)
router.post(
    "/:id/upload-document",
    handleUpload(upload.single("file")),
    controller.uploadDocument
);

// Submit e-SI to ODEX
router.post("/:id/submit-esi", controller.submitESI);

// Fetch Gate Pass / Form 13 from ODEX
router.post("/:id/fetch-gate-pass", controller.fetchGatePass);

module.exports = router;
