/**
 * @file charge.model.js
 * @description Sequelize model for Charge Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const Charge = sequelize.define("Charge", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    charge_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    charge_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    charge_type: {
        type: DataTypes.ENUM("Revenue", "Expense", "Both"),
        allowNull: false,
    },
    applicable_module: {
        type: DataTypes.ENUM("Inquiry", "Quotation", "Shipment", "Customs", "Billing", "Transport"),
        allowNull: false,
    },
    tax_applicable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    default_currency: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
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
    tableName: "charges",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Charge;
