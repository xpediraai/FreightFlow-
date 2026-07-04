const express = require('express');
const router = express.Router();

const authRoutes = require('./modules/Auth/Users/users.routes');
const companyRoutes = require('./modules/Masters/CompanyMasters/company.routes');
const countryRoutes = require('./modules/Masters/CountryMasters/country.routes');
const stateRoutes = require('./modules/Masters/StateMasters/state.routes');
const cityRoutes = require('./modules/Masters/CityMasters/city.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/country', countryRoutes);
router.use('/state', stateRoutes);
router.use('/city', cityRoutes);

module.exports = router;
