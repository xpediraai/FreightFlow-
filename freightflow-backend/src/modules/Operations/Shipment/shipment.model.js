/**
 * @file shipment.model.js
 * @description Sequelize model for Shipment entity.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Shipment = sequelize.define("Shipment", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    shipment_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shipment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    branch_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    vendor_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    agent_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    shipment_type: {
        type: DataTypes.ENUM("Import", "Export", "Domestic", "Cross-Trade"),
        defaultValue: "Export",
    },
    service_type_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    sales_person_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    operation_executive_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    // Cargo
    commodity_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    package_type_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    uom_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    gross_weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    volume_cbm: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    no_of_packages: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    is_dangerous_goods: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // Route
    origin_country_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    origin_port_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    destination_country_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    destination_port_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    final_destination: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Transport
    transport_mode_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    shipping_line_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    vehicle_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    warehouse_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    etd: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    eta: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    // Commercial
    currency_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 4),
        defaultValue: 1.0000,
    },
    payment_term_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    incoterm_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    charge_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("Draft", "Confirmed", "In-Transit", "Delivered", "Cancelled"),
        defaultValue: "Draft",
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
    tableName: "shipments",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'shipment_number'],
            where: {
                deleted_at: null
            }
        }
    ]
});

module.exports = Shipment;
