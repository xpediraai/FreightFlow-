/**
 * @file employee.model.js
 * @description Sequelize model for Employee Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Employee = sequelize.define("Employee", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    employee_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    middle_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    doj: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    alternate_mobile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    department_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    designation_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
    address_line_1: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    address_line_2: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    aadhaar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pan: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    passport: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reporting_manager: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    employment_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    blood_group: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    emergency_contact: {
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
    tableName: "employees",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
});

module.exports = Employee;
