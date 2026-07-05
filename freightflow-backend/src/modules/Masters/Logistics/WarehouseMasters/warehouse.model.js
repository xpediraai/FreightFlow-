/**
 * @file warehouse.model.js
 * @description Sequelize model for Warehouse Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const Warehouse = sequelize.define("Warehouse", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    warehouse_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    warehouse_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    warehouse_type: {
        type: DataTypes.STRING,
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
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contact_person: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    capacity: {
        type: DataTypes.DECIMAL(15, 2),
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
    tableName: "warehouses",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Warehouse;
