/**
 * @file employee.routes.js
 * @description Express routes for Employee APIs.
 */
const express = require("express");
const router = express.Router();
const employeeController = require("./employee.controller");
const { authenticateToken } = require("../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", employeeController.create);
router.get("/", employeeController.list);
router.get("/:id", employeeController.getById);
router.put("/:id", employeeController.update);
router.patch("/:id/status", employeeController.changeStatus);
router.delete("/:id", employeeController.remove);

module.exports = router;
