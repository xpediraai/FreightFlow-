const express = require('express');
const router = express.Router();
const bulkImportController = require('./bulkImport.controller');
const { authenticateToken } = require('../../middlewares/auth.middleware');

router.use(authenticateToken);

router.post('/:entityType', bulkImportController.bulkImportHandler);

module.exports = router;
