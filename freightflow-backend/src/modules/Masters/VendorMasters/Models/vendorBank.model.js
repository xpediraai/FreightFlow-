/**
 * @file vendorBank.model.js
 * @description Sequelize model for Vendor Bank Accounts.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const VendorBank = sequelize.define("VendorBank", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    vendor_id: {
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
    tableName: "vendor_bank_accounts",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = VendorBank;
