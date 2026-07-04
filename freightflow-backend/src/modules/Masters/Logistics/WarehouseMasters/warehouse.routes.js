/**
 * @file warehouse.routes.js
 * @description Express routes for Warehouse APIs.
 */
const express = require("express");
const router = express.Router();
const warehouseController = require("./warehouse.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", warehouseController.create);
router.get("/", warehouseController.list);
router.get("/:id", warehouseController.getById);
router.put("/:id", warehouseController.update);
router.patch("/:id/status", warehouseController.changeStatus);
router.delete("/:id", warehouseController.remove);

module.exports = router;
