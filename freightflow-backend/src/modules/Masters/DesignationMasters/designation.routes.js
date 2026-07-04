/**
 * @file designation.routes.js
 * @description Express routes for Designation APIs.
 */
const express = require("express");
const router = express.Router();
const designationController = require("./designation.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", designationController.create);
router.get("/", designationController.list);
router.get("/:id", designationController.getById);
router.put("/:id", designationController.update);
router.patch("/:id/status", designationController.changeStatus);
router.delete("/:id", designationController.remove);

module.exports = router;
