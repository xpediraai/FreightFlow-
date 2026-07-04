/**
 * @file port.model.js
 * @description Sequelize model for Port Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Port = sequelize.define("Port", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    port_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    port_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    state_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    city_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    time_zone: {
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
    tableName: "ports",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'port_code'],
            where: {
                deleted_at: null
            }
        }
    ]
});

module.exports = Port;
