/**
 * @file dbConnection.js
 * @description Manages database lifecycle connection, checking connectivity using Sequelize authentication.
 * @module config/dbConnection
 * @requires config/database
 */

const sequelize = require("./database");

/**
 * Authenticates the database connection asynchronously.
 * Logs success on connection or logs the failure and terminates the application with exit code 1.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is successfully authenticated.
 * @throws {Error} Exits the process if authentication fails.
 */
const connectDB = async () => {
    try {
        // Test if connection parameters are correct and database is reachable
        await sequelize.authenticate();

        console.log("✅ PostgreSQL Connected Successfully");
    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error.message);

        // Terminate process with failure code (1) to prevent the web server from running in an unhealthy state
        process.exit(1);
    }
};

module.exports = connectDB;