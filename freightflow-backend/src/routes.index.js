const express = require('express');
const router = express.Router();

const companyRoutes = require('./modules/company/company.routes');

// Mount company routes
router.use('/company', companyRoutes);

module.exports = router;
