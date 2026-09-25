/**
 * @file exportClearing.controller.js
 * @description HTTP Controller for Export Clearing ODEX API & Document Upload endpoints.
 */

const exportClearingService = require("./exportClearing.service");
const { successResponse, errorResponse } = require("../../../utils/response");

/**
 * POST /api/export-clearing/:id/odex-sync
 * Synchronize clearing record with ODEX API.
 */
const syncODEX = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body || {};

        const result = await exportClearingService.syncWithODEX(id, payload);

        return res.status(200).json(
            successResponse("ODEX_SYNC_SUCCESS", "Successfully synced with ODEX Customs API.", "Synced.", result)
        );
    } catch (err) {
        return res.status(500).json(
            errorResponse("ODEX_SYNC_ERROR", err.message, "Failed to synchronize with ODEX API.")
        );
    }
};

/**
 * POST /api/export-clearing/:id/upload-document
 * Upload a document for Export Clearing job.
 */
const uploadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        const docData = req.body || {};

        const result = await exportClearingService.uploadClearingDocument(id, file, docData);

        return res.status(200).json(
            successResponse("DOCUMENT_UPLOAD_SUCCESS", "Document uploaded successfully.", "Uploaded.", result)
        );
    } catch (err) {
        return res.status(500).json(
            errorResponse("DOCUMENT_UPLOAD_ERROR", err.message, "Failed to upload clearing document.")
        );
    }
};

/**
 * POST /api/export-clearing/:id/submit-esi
 * Submit electronic Shipping Bill (e-SI) to ODEX gateway.
 */
const submitESI = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body || {};

        const result = await exportClearingService.submitODEX_ESI(id, payload);

        return res.status(200).json(
            successResponse("ODEX_ESI_SUBMITTED", "Electronic SI submitted to ODEX.", "Submitted.", result)
        );
    } catch (err) {
        return res.status(500).json(
            errorResponse("ODEX_ESI_ERROR", err.message, "Failed to submit e-SI to ODEX.")
        );
    }
};

/**
 * POST /api/export-clearing/:id/fetch-gate-pass
 * Fetch ODEX Form 13 / Gate Pass.
 */
const fetchGatePass = async (req, res) => {
    try {
        const { id } = req.params;
        const { containerNo } = req.body || {};

        const result = await exportClearingService.fetchODEXGatePass(id, containerNo);

        return res.status(200).json(
            successResponse("GATE_PASS_FETCHED", "Form 13 / Gate Pass retrieved from ODEX.", "Retrieved.", result)
        );
    } catch (err) {
        return res.status(500).json(
            errorResponse("GATE_PASS_ERROR", err.message, "Failed to retrieve Form 13 / Gate Pass.")
        );
    }
};

module.exports = {
    syncODEX,
    uploadDocument,
    submitESI,
    fetchGatePass,
};
