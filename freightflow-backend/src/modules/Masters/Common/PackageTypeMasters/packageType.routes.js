/**
 * @file packageType.routes.js
 * @description Express routes for Package Type Master APIs.
 */
const express = require("express");
const router = express.Router();
const packageTypeController = require("./packageType.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", packageTypeController.create);
router.get("/", packageTypeController.list);
router.get("/:id", packageTypeController.getById);
router.put("/:id", packageTypeController.update);
router.patch("/:id/status", packageTypeController.changeStatus);
router.delete("/:id", packageTypeController.remove);

module.exports = router;
