/**
 * @file tracking.model.js
 * @description Sequelize models for Multi-Source Shipment Tracking & Continuous Monitoring.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

/**
 * Main Shipment Tracking Model
 */
const ShipmentTracking = sequelize.define("ShipmentTracking", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    bl_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shipping_line_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    shipping_line_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shipping_line_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vessel_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    voyage_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    connecting_vessel_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    connecting_voyage_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vessels: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    imo_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    pol_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pol_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pod_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pod_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    current_location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    speed_knots: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    heading: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    nav_status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    consolidated_eta: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    carrier_eta: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    port_eta: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    ais_eta: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    shipment_status: {
        type: DataTypes.STRING,
        defaultValue: "In Transit", // e.g. Booked, Loaded, In Transit, Vessel Arrived, Berthed, Discharged, Gate Out, Completed
    },
    tracking_mode: {
        type: DataTypes.ENUM("Pending_Review", "Active_Monitoring", "Completed", "Cancelled"),
        defaultValue: "Active_Monitoring",
    },
    discrepancies: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    sources_snapshot: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    last_checked_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    last_meaningful_change_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    tableName: "shipment_trackings",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'bl_number'],
            where: { deleted_at: null }
        },
        {
            fields: ['company_id', 'tracking_mode']
        },
        {
            fields: ['vessel_name']
        }
    ]
});

/**
 * Container Details linked to Shipment Tracking
 */
const ShipmentTrackingContainer = sequelize.define("ShipmentTrackingContainer", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    tracking_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    container_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    container_type: {
        type: DataTypes.STRING,
        allowNull: true, // e.g. 40HC, 20GP
    },
    seal_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "In Transit",
    },
    last_location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    milestones: {
        type: DataTypes.JSONB,
        defaultValue: [],
    }
}, {
    tableName: "shipment_tracking_containers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

/**
 * Audit & Event History for Meaningful Changes
 */
const ShipmentTrackingHistory = sequelize.define("ShipmentTrackingHistory", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    tracking_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    event_type: {
        type: DataTypes.STRING,
        allowNull: false, // e.g. INITIAL_FETCH, STATUS_CHANGE, ETA_UPDATE, LOCATION_PROGRESS, BERTHING_UPDATE, DISCHARGE_UPDATE, MANUAL_OVERRIDE
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    previous_status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    new_status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    previous_eta: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    new_eta: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    coordinates: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    source_attribution: {
        type: DataTypes.STRING,
        allowNull: true, // e.g. "CMA CGM Portal", "Adani Mundra", "MarineTraffic AIS", "Staff Override"
    },
    raw_diff: {
        type: DataTypes.JSONB,
        allowNull: true,
    }
}, {
    tableName: "shipment_tracking_histories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

/**
 * Raw Source Logs for Traceability
 */
const ShipmentTrackingSourceLog = sequelize.define("ShipmentTrackingSourceLog", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    tracking_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    source_name: {
        type: DataTypes.STRING,
        allowNull: false, // e.g. "SHIPPING_LINE", "ADANI_MUNDRA", "DP_WORLD", "MARINE_TRAFFIC"
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "SUCCESS", // "SUCCESS", "NOT_FOUND", "ERROR"
    },
    payload: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    fetched_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: "shipment_tracking_source_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

module.exports = {
    ShipmentTracking,
    ShipmentTrackingContainer,
    ShipmentTrackingHistory,
    ShipmentTrackingSourceLog
};


