/**
 * @file booking.model.js
 * @description Sequelize model definition for Booking.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Booking = sequelize.define(
    "Booking",
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
        booking_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        booking_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        vessel_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        voyage_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        shipping_line_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        si_cutoff_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        vgm_cutoff_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        gate_in_cutoff_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(30),
            defaultValue: "CONFIRMED",
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
        tableName: "bookings",
        timestamps: true,
        paranoid: true,
        underscored: true,
    }
);

module.exports = Booking;
