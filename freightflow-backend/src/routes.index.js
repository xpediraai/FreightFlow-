const express = require('express');
const router = express.Router();

const authRoutes = require('./modules/Auth/Users/users.routes');
const companyRoutes = require('./modules/Masters/CompanyMasters/company.routes');
const countryRoutes = require('./modules/Masters/CountryMasters/country.routes');
const stateRoutes = require('./modules/Masters/StateMasters/state.routes');
const cityRoutes = require('./modules/Masters/CityMasters/city.routes');
const currencyRoutes = require('./modules/Masters/CurrencyMasters/currency.routes');
const portRoutes = require('./modules/Masters/PortMasters/port.routes');
const shippingLineRoutes = require('./modules/Masters/ShippingLineMasters/shippingLine.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/country', countryRoutes);
router.use('/state', stateRoutes);
router.use('/city', cityRoutes);
router.use('/currency', currencyRoutes);
router.use('/port', portRoutes);
router.use('/shipping-line', shippingLineRoutes);

module.exports = router;
