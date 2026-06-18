/**
 * @file index.js
 * @description Central database entry point. Consolidates the Sequelize client instance,
 * loads models, and registers database relationships/associations.
 * @module database/index
 * @requires config/database
 */

const sequelize = require("../config/database");

// Registry object to hold Sequelize, Sequelize constructors, and model definitions
const db = {};

// Attach the configured Sequelize client instance
db.sequelize = sequelize;

// Note: As additional models (e.g., User, Company, Job) are created, they will be imported 
// and registered here to facilitate consolidated exports and manage model associations.

module.exports = db;