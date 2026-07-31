/**
 * @file tracking.model.js
 * @description Sequelize model definition for Shipment Tracking Milestones.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Tracking = sequelize.define(
    "Tracking",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        shipment_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        job_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        milestone_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        event_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("COMPLETED", "PENDING", "DELAYED"),
            defaultValue: "COMPLETED",
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true,
        }
    },
    {
        tableName: "shipment_trackings",
        timestamps: true,
        paranoid: true,
        underscored: true,
    }
);

module.exports = Tracking;
