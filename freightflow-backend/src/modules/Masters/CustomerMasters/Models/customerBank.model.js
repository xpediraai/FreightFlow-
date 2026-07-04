/**
 * @file customerBank.model.js
 * @description Sequelize model for Customer Bank Accounts.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const CustomerBank = sequelize.define("CustomerBank", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    bank_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    account_holder: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    account_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ifsc_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    swift_code: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: "customer_bank_accounts",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = CustomerBank;
