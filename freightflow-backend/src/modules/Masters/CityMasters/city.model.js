/**
 * @file city.model.js
 * @description Sequelize model for City Master.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const Country = require("../CountryMasters/country.model");
const State = require("../StateMasters/state.model");

const City = sequelize.define("City", {
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
    state_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "states",
            key: "id"
        }
    },
    city_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gst: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pincode: {
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
    tableName: "cities",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'state_id', 'city_code'],
            where: {
                deleted_at: null
            }
        }
    ]
});

// Associations
City.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });
Country.hasMany(City, { foreignKey: 'country_id', as: 'cities' });

City.belongsTo(State, { foreignKey: 'state_id', as: 'state' });
State.hasMany(City, { foreignKey: 'state_id', as: 'cities' });

module.exports = City;
