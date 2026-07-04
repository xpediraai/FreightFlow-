/**
 * @file incoterm.model.js
 * @description Sequelize model for Incoterm Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Incoterm = sequelize.define("Incoterm", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    incoterm_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    incoterm_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    transport_mode: {
        type: DataTypes.STRING,
        allowNull: true,
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
    tableName: "incoterms",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Incoterm;
