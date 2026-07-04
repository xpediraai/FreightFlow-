/**
 * @file vehicle.routes.js
 * @description Express routes for Vehicle APIs.
 */
const express = require("express");
const router = express.Router();
const vehicleController = require("./vehicle.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", vehicleController.create);
router.get("/", vehicleController.list);
router.get("/:id", vehicleController.getById);
router.put("/:id", vehicleController.update);
router.patch("/:id/status", vehicleController.changeStatus);
router.delete("/:id", vehicleController.remove);

module.exports = router;
