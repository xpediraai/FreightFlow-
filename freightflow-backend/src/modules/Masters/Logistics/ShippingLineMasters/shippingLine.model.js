/**
 * @file shippingLine.model.js
 * @description Sequelize model for Shipping Line Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const ShippingLine = sequelize.define("ShippingLine", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    shipping_line_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shipping_line_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    scac_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    contact_person: {
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
    tableName: "shipping_lines",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'shipping_line_code'],
            where: { deleted_at: null }
        },
        {
            unique: true,
            fields: ['company_id', 'shipping_line_name'],
            where: { deleted_at: null }
        }
    ]
});

module.exports = ShippingLine;
