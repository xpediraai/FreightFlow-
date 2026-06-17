/**
 * @file app.js
 * @description Configures the Express application instance, integrating essential security,
 * utility middleware, and initial routing.
 * @module app
 * @requires express
 * @requires cors
 * @requires helmet
 * @requires cookie-parser
 * @requires morgan
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

// Initialize Express application instance
const app = express();

// Parses incoming requests with JSON payloads (adds parsed data to req.body)
app.use(express.json());

// Enables Cross-Origin Resource Sharing (CORS) to allow requests from external domains/frontends
app.use(cors());

// Enhances application security by setting various HTTP headers (guards against XSS, clickjacking, etc.)
app.use(helmet());

// Parses cookie headers and populates req.cookies with an object keyed by the cookie names
app.use(cookieParser());

// HTTP request logger middleware for development environment logging
app.use(morgan("dev"));

/**
 * Diagnostic / Health Check Endpoint
 * Simple endpoint to verify the server status and API availability.
 * 
 * @name GET/freightflow/test
 * @function
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
app.get("/freightflow/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "FreightFlow API Running"
    });
});

module.exports = app;