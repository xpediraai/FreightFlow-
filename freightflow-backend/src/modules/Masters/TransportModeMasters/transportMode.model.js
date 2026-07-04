/**
 * @file transportMode.model.js
 * @description Sequelize model for Transport Mode Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const TransportMode = sequelize.define("TransportMode", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    mode_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mode_name: {
        type: DataTypes.STRING,
        allowNull: false,
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
    tableName: "transport_modes",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'mode_code'],
            where: { deleted_at: null }
        },
        {
            unique: true,
            fields: ['company_id', 'mode_name'],
            where: { deleted_at: null }
        }
    ]
});

module.exports = TransportMode;
