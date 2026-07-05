const express = require("express");
const router = express.Router();
const customerController = require("./customer.controller");
const { authenticateToken } = require("../../../../middlewares/auth.middleware");
const { upload, handleUpload } = require("../../../../middlewares/upload.middleware");

router.use(authenticateToken);

// Custom middleware to set context
const setUploadContext = (req, res, next) => {
    req.uploadContext = "Customers";
    next();
};

router.post("/upload", setUploadContext, handleUpload(upload.single("document")), customerController.uploadDocument);

router.post("/", customerController.create);
router.get("/", customerController.list);
router.get("/:id", customerController.getById);
router.put("/:id", customerController.update);
router.patch("/:id/status", customerController.changeStatus);
router.delete("/:id", customerController.remove);

module.exports = router;
