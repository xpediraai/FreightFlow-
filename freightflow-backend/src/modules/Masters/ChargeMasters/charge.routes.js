/**
 * @file charge.routes.js
 * @description Express routes for Charge Master APIs.
 */
const express = require("express");
const router = express.Router();
const chargeController = require("./charge.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", chargeController.create);
router.get("/", chargeController.list);
router.get("/:id", chargeController.getById);
router.put("/:id", chargeController.update);
router.patch("/:id/status", chargeController.changeStatus);
router.delete("/:id", chargeController.remove);

module.exports = router;
