/**
 * @file country.model.js
 * @description Sequelize model for Country Master.
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../../../../config/database");

const Country = sequelize.define("Country", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    country_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone_code: {
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
    tableName: "countries",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'country_code'],
            where: {
                deleted_at: null
            }
        }
    ]
});

module.exports = Country;
