/**
 * @file currency.model.js
 * @description Sequelize model for Currency Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Currency = sequelize.define("Currency", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    currency_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    currency_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 4),
        defaultValue: 1.0000,
        allowNull: false,
    },
    base_currency: {
        type: DataTypes.ENUM("Yes", "No"),
        defaultValue: "No",
        allowNull: false,
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
    tableName: "currencies",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'currency_code'],
            where: {
                deleted_at: null
            }
        }
    ]
});

module.exports = Currency;
