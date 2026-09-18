/**
 * @file shippingInquiry.routes.js
 * @description Express routes for Export Shipping Inquiry CRUD operations.
 */
const express = require("express");
const router = express.Router();
const shippingInquiryController = require("./shippingInquiry.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", shippingInquiryController.create);
router.get("/", shippingInquiryController.list);
router.get("/:id", shippingInquiryController.getById);
router.put("/:id", shippingInquiryController.update);
router.patch("/:id/status", shippingInquiryController.changeStatus);
router.delete("/:id", shippingInquiryController.remove);

module.exports = router;
