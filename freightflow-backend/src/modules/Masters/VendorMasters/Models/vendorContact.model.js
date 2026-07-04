/**
 * @file vendorContact.model.js
 * @description Sequelize model for Vendor Contacts.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const VendorContact = sequelize.define("VendorContact", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    vendor_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    designation: {
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
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: "vendor_contacts",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = VendorContact;
