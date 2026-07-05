/**
 * @file vendor.routes.js
 * @description Express routes for Vendor APIs.
 */
const express = require("express");
const router = express.Router();
const vendorController = require("./vendor.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", vendorController.create);
router.get("/", vendorController.list);
router.get("/:id", vendorController.getById);
router.put("/:id", vendorController.update);
router.patch("/:id/status", vendorController.changeStatus);
router.delete("/:id", vendorController.remove);

module.exports = router;
