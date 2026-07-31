/**
 * @file shipmentCharge.model.js
 * @description Sequelize model definition for Operations Finance Charges.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const ShipmentCharge = sequelize.define(
    "ShipmentCharge",
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
        charge_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        charge_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        charge_type: {
            type: DataTypes.ENUM("INCOME", "EXPENSE"),
            allowNull: false,
            defaultValue: "INCOME",
        },
        vendor_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        currency_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        tax_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
        },
        net_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        status: {
            type: DataTypes.STRING(30),
            defaultValue: "PENDING",
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
        tableName: "shipment_charges",
        timestamps: true,
        paranoid: true,
        underscored: true,
    }
);

module.exports = ShipmentCharge;
