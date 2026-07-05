/**
 * @file commodity.model.js
 * @description Sequelize model for Commodity Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const Commodity = sequelize.define("Commodity", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    commodity_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    commodity_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hs_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    hazardous: {
        type: DataTypes.ENUM("Yes", "No"),
        defaultValue: "No",
    },
    hazard_class: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    default_unit: {
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
    tableName: "commodities",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'commodity_code'],
            where: { deleted_at: null }
        },
        {
            unique: true,
            fields: ['company_id', 'hs_code'],
            where: { deleted_at: null, hs_code: { [require("sequelize").Op.ne]: null } }
        }
    ]
});

module.exports = Commodity;
