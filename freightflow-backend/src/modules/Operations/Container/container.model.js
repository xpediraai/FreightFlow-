/**
 * @file container.model.js
 * @description Sequelize model definition for Container.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Container = sequelize.define(
    "Container",
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
        container_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        container_type_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        seal_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        gross_weight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        tare_weight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        cbm: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        payload: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(30),
            defaultValue: "Gate-In",
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
        tableName: "containers",
        timestamps: true,
        paranoid: true,
        underscored: true,
    }
);

module.exports = Container;
