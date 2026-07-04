/**
 * @file driver.routes.js
 * @description Express routes for Driver APIs.
 */
const express = require("express");
const router = express.Router();
const driverController = require("./driver.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", driverController.create);
router.get("/", driverController.list);
router.get("/:id", driverController.getById);
router.put("/:id", driverController.update);
router.patch("/:id/status", driverController.changeStatus);
router.delete("/:id", driverController.remove);

module.exports = router;
