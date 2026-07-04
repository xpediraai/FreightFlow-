/**
 * @file department.routes.js
 * @description Express routes for Department APIs.
 */
const express = require("express");
const router = express.Router();
const departmentController = require("./department.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", departmentController.create);
router.get("/", departmentController.list);
router.get("/:id", departmentController.getById);
router.put("/:id", departmentController.update);
router.patch("/:id/status", departmentController.changeStatus);
router.delete("/:id", departmentController.remove);

module.exports = router;
