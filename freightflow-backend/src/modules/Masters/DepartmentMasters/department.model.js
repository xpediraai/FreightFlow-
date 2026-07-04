/**
 * @file department.model.js
 * @description Sequelize model for Department Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Department = sequelize.define("Department", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    department_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    department_name: {
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
    tableName: "departments",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Department;
