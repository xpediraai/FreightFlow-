/**
 * @file exportClearing.service.js
 * @description Service for managing Export Clearing operations, ODEX API sync, and Document Uploads.
 */

const odexService = require("./odex.service");

// In-memory persistent cache for backend storage fallback
const clearingJobsStore = new Map();

/**
 * Sync clearing job details with ODEX API.
 * @param {string} id Job or Clearing Record ID
 * @param {object} payload 
 */
async function syncWithODEX(id, payload = {}) {
    const sbNo = payload.shippingBillNo || payload.sbNo;
    const sbDate = payload.shippingBillDate || payload.sbDate;

    const odexResult = await odexService.syncShippingBillStatus(id, sbNo, {
        sbDate,
        portCode: payload.portCode,
    });

    // Merge result into store if present
    const existing = clearingJobsStore.get(id) || {};
    const updated = {
        ...existing,
        id,
        odexStatus: "SYNCED",
        odexRefId: odexResult.odexRefId,
        odexLastSyncedAt: odexResult.lastSyncedAt,
        shippingBillNo: odexResult.customsDetails.shippingBillNo,
        shippingBillDate: odexResult.customsDetails.shippingBillDate,
        assessmentNo: odexResult.customsDetails.assessmentNo,
        assessmentDate: odexResult.customsDetails.assessmentDate,
        examinationResult: odexResult.customsDetails.examinationResult,
        examinationDate: odexResult.customsDetails.examinationDate,
        queryNo: odexResult.customsDetails.queryNo,
        queryDate: odexResult.customsDetails.queryDate,
        queryRemarks: odexResult.customsDetails.queryRemarks,
        leoNo: odexResult.customsDetails.leoNo,
        leoDate: odexResult.customsDetails.leoDate,
        status: "Completed",
        updatedAt: new Date().toISOString(),
    };

    clearingJobsStore.set(id, updated);

    return {
        ...odexResult,
        updatedClearingRecord: updated,
    };
}

/**
 * Handle document upload and auto verification for a clearing document.
 * @param {string} id 
 * @param {object} file 
 * @param {object} docData 
 */
async function uploadClearingDocument(id, file, docData = {}) {
    if (!file) {
        throw new Error("No file uploaded.");
    }

    const docType = docData.documentType || docData.name || "Customs Document";
    const autoVerify = docData.autoVerify === "true" || docData.autoVerify === true;

    let verificationResult = null;
    if (autoVerify) {
        verificationResult = await odexService.autoVerifyDocument(docType, file.originalname);
    }

    const uploadedDoc = {
        id: docData.documentId || `doc-${Date.now()}`,
        name: docType,
        documentNo: verificationResult?.documentNo || docData.documentNo || "",
        fileName: file.originalname,
        filePath: file.path ? `/uploads/Companies/${file.filename}` : file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        status: verificationResult?.status || "Received",
        uploadedDate: new Date().toISOString().split("T")[0],
        remarks: verificationResult?.remarks || docData.remarks || "Uploaded successfully.",
        extractedDetails: verificationResult?.extractedFields || null,
    };

    return {
        success: true,
        document: uploadedDoc,
        message: `Document '${file.originalname}' uploaded for ${docType}.`,
    };
}

/**
 * Submit electronic Shipping Bill to ODEX platform.
 */
async function submitODEX_ESI(id, payload) {
    const result = await odexService.submitElectronicSI(payload);
    return result;
}

/**
 * Fetch ODEX Gate Pass / Form 13.
 */
async function fetchODEXGatePass(id, containerNo) {
    const result = await odexService.fetchGatePass(id, containerNo);
    return result;
}

module.exports = {
    syncWithODEX,
    uploadClearingDocument,
    submitODEX_ESI,
    fetchODEXGatePass,
};
