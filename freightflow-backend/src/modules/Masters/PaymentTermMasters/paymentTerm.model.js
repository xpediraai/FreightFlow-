/**
 * @file paymentTerm.model.js
 * @description Sequelize model for Payment Term Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const PaymentTerm = sequelize.define("PaymentTerm", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    payment_term_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    payment_term_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    credit_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    tableName: "payment_terms",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = PaymentTerm;
