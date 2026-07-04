/**
 * @file vehicle.model.js
 * @description Sequelize model for Vehicle Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Vehicle = sequelize.define("Vehicle", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    vehicle_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vehicle_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vehicle_capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    vehicle_owner: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vendor_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    registration_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    registration_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    insurance_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    insurance_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fitness_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    pollution_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    gps_enabled: {
        type: DataTypes.ENUM("Yes", "No"),
        defaultValue: "No",
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
    tableName: "vehicles",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Vehicle;
