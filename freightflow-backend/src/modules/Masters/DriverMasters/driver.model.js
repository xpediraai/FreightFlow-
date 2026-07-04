/**
 * @file driver.model.js
 * @description Sequelize model for Driver Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Driver = sequelize.define("Driver", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    driver_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    driver_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    alternate_mobile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    country_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    state_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    city_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    license_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    license_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    license_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    aadhaar_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pan_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vendor_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("Active", "Inactive"),
        defaultValue: "Active",
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
    }
}, {
    tableName: "drivers",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Driver;
