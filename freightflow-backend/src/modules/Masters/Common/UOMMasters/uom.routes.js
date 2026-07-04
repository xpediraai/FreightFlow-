/**
 * @file uom.routes.js
 * @description Express routes for UOM Master APIs.
 */
const express = require("express");
const router = express.Router();
const uomController = require("./uom.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");

router.use(authenticateToken);

router.post("/", uomController.create);
router.get("/", uomController.list);
router.get("/:id", uomController.getById);
router.put("/:id", uomController.update);
router.patch("/:id/status", uomController.changeStatus);
router.delete("/:id", uomController.remove);

module.exports = router;
