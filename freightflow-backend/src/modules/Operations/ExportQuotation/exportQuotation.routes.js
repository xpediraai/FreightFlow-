/**
 * @file exportQuotation.routes.js
 * @description Express routes for Export Quotation CRUD operations.
 */
const express = require("express");
const router = express.Router();
const exportQuotationController = require("./exportQuotation.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

const { upload, handleUpload } = require("../../../middlewares/upload.middleware");

router.use(authenticateToken);

const setUploadContext = (req, res, next) => {
  req.uploadContext = "Quotations";
  next();
};

router.post(
  "/upload",
  setUploadContext,
  handleUpload(upload.array("attachments", 50)),
  exportQuotationController.uploadAttachments
);

router.post("/", exportQuotationController.create);
router.get("/", exportQuotationController.list);
router.get("/:id", exportQuotationController.getById);
router.put("/:id", exportQuotationController.update);
router.patch("/:id/status", exportQuotationController.changeStatus);
router.delete("/:id", exportQuotationController.remove);

module.exports = router;

