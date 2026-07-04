/**
 * @file incoterm.routes.js
 * @description Express routes for Incoterm Master APIs.
 */
const express = require("express");
const router = express.Router();
const incotermController = require("./incoterm.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", incotermController.create);
router.get("/", incotermController.list);
router.get("/:id", incotermController.getById);
router.put("/:id", incotermController.update);
router.patch("/:id/status", incotermController.changeStatus);
router.delete("/:id", incotermController.remove);

module.exports = router;
