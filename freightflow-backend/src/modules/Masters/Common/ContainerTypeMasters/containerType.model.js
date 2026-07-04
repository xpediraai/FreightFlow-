/**
 * @file containerType.model.js
 * @description Sequelize model for Container Type Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const ContainerType = sequelize.define("ContainerType", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    container_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    container_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    iso_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    size: {
        type: DataTypes.ENUM("20", "40", "45"),
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM("Dry", "Reefer", "Open Top", "Flat Rack", "Tank"),
        allowNull: false,
    },
    capacity_cbm: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    max_weight: {
        type: DataTypes.DECIMAL(10, 2),
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
    tableName: "container_types",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'container_code'],
            where: { deleted_at: null }
        },
        {
            unique: true,
            fields: ['company_id', 'iso_code'],
            where: { deleted_at: null }
        }
    ]
});

module.exports = ContainerType;
