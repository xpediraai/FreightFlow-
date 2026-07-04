/**
 * @file state.model.js
 * @description Sequelize model for State Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const State = sequelize.define("State", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    country_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "countries",
            key: "id"
        }
    },
    state_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gst_state_code: {
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
    tableName: "states",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'country_id', 'state_code'],
            where: {
                deleted_at: null
            }
        }
    ]
});

module.exports = State;
