/**
 * @file vendor.model.js
 * @description Sequelize model for Vendor Master (Primary Table).
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const Vendor = sequelize.define("Vendor", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    vendor_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vendor_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vendor_type: {
        type: DataTypes.ENUM("Shipping Line", "Transporter", "CHA", "CFS", "Warehouse", "Surveyor", "Other"),
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
    currency_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    payment_terms: {
        type: DataTypes.STRING,
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
    tableName: "vendors",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Vendor;
