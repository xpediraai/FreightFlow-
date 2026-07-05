/**
 * @file paymentTerm.routes.js
 * @description Express routes for Payment Term Master APIs.
 */
const express = require("express");
const router = express.Router();
const paymentTermController = require("./paymentTerm.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", paymentTermController.create);
router.get("/", paymentTermController.list);
router.get("/:id", paymentTermController.getById);
router.put("/:id", paymentTermController.update);
router.patch("/:id/status", paymentTermController.changeStatus);
router.delete("/:id", paymentTermController.remove);

module.exports = router;
