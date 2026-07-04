/**
 * @file designation.model.js
 * @description Sequelize model for Designation Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const Designation = sequelize.define("Designation", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    department_id: {
        type: DataTypes.UUID,
        allowNull: true, // Nullable FK
    },
    designation_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    designation_name: {
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
    tableName: "designations",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Designation;
