/**
 * @file billOfLading.model.js
 * @description Sequelize model definition for Bill of Lading (HBL / MBL).
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const BillOfLading = sequelize.define(
    "BillOfLading",
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
        bl_type: {
            type: DataTypes.ENUM("HBL", "MBL"),
            allowNull: false,
            defaultValue: "HBL",
        },
        bl_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        shipper_details: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        consignee_details: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notify_party: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        place_of_receipt: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        port_of_loading: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        port_of_discharge: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        place_of_delivery: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ocean_vessel: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        voyage_no: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        freight_term: {
            type: DataTypes.ENUM("PREPAID", "COLLECT"),
            defaultValue: "PREPAID",
        },
        total_packages: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        gross_weight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        measurement_cbm: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        issue_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(30),
            defaultValue: "DRAFT",
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
        tableName: "bills_of_lading",
        timestamps: true,
        paranoid: true,
        underscored: true,
    }
);

module.exports = BillOfLading;
