/**
 * @file vendorAddress.model.js
 * @description Sequelize model for Vendor Addresses.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../../config/database");

const VendorAddress = sequelize.define("VendorAddress", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    vendor_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    address_type: {
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
    address_line_1: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    address_line_2: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: "vendor_addresses",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = VendorAddress;
