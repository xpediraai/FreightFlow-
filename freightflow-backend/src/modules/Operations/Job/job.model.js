/**
 * @file job.model.js
 * @description Sequelize model for Job entity.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Job = sequelize.define("Job", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    job_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shipment_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    assigned_employee_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    department_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    priority: {
        type: DataTypes.ENUM("Low", "Medium", "High", "Urgent"),
        defaultValue: "Medium",
    },
    status: {
        type: DataTypes.ENUM("Pending", "In-Progress", "Completed", "On-Hold", "Cancelled"),
        defaultValue: "Pending",
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    deleted_by: {
        type: DataTypes.UUID,
        allowNull: true,
    }
}, {
    tableName: "jobs",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'job_number'],
            where: {
                deleted_at: null
            }
        },
        {
            unique: true,
            fields: ['company_id', 'shipment_id'],
            where: {
                deleted_at: null
            }
        }
    ]
});

module.exports = Job;
