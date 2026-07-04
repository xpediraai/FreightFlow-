/**
 * @file customer.model.js
 * @description Sequelize model for Customer Master (Primary Table).
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Customer = sequelize.define("Customer", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    customer_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customer_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    customer_category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gst_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pan_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    iec_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cin_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tan_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    credit_limit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    payment_terms: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    currency_id: {
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
    tableName: "customers",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Customer;
