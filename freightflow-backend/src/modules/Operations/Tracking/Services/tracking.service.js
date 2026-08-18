/**
 * @file tracking.service.js
 * @description Business logic for Shipment Tracking database operations, confirmation, refresh, and history.
 */

const { Op } = require("sequelize");
const sequelize = require("../../../../config/database");
const {
    ShipmentTracking,
    ShipmentTrackingContainer,
    ShipmentTrackingHistory,
    ShipmentTrackingSourceLog
} = require("../tracking.model");
const { aggregateMultiSourceTracking } = require("./trackingAggregator.service");
const path = require("path");
const { writeLogToFile } = require("../../../../services/loggerService");

const trackingLogPath = path.join(__dirname, "../../../../../logs/Tracking/TrackingActions.txt");

/**
 * Executes multi-source live tracking preview without persisting to DB
 */
const fetchLiveTracking = async (shippingLineName, blNumber, shippingLineId = null) => {
    return await aggregateMultiSourceTracking(shippingLineName, blNumber, shippingLineId);
};

/**
 * Confirms a multi-source tracking result and activates continuous background monitoring.
 */
const confirmTracking = async (companyId, trackingData, userId, reqInfo = {}) => {
    const transaction = await sequelize.transaction();
    try {
        const { consolidated, sources, override_values } = trackingData;
        const cleanBL = consolidated.bl_number.trim().toUpperCase();

        // 1. Check if tracking record already exists for this company
        let record = await ShipmentTracking.findOne({
            where: { company_id: companyId, bl_number: cleanBL },
            transaction
        });

        const effectiveVessel = override_values?.vessel_name || consolidated.vessel_name;
        const effectiveVoyage = override_values?.voyage_number || consolidated.voyage_number;
        const effectiveEta = override_values?.eta || consolidated.consolidated_eta;
        const effectiveStatus = override_values?.status || consolidated.shipment_status;

        const mainPayload = {
            company_id: companyId,
            bl_number: cleanBL,
            shipping_line_id: trackingData.shipping_line_id || null,
            shipping_line_name: consolidated.shipping_line_name,
            shipping_line_code: consolidated.shipping_line_code,
            vessel_name: effectiveVessel,
            voyage_number: effectiveVoyage,
            imo_number: consolidated.imo_number,
            pol_name: consolidated.pol?.name,
            pol_code: consolidated.pol?.code,
            pod_name: consolidated.pod?.name,
            pod_code: consolidated.pod?.code,
            current_location: consolidated.current_location,
            latitude: consolidated.latitude,
            longitude: consolidated.longitude,
            speed_knots: consolidated.speed_knots,
            heading: consolidated.heading,
            nav_status: consolidated.nav_status,
            consolidated_eta: effectiveEta,
            carrier_eta: consolidated.carrier_eta,
            port_eta: consolidated.port_eta,
            ais_eta: consolidated.ais_eta,
            shipment_status: effectiveStatus,
            tracking_mode: "Active_Monitoring",
            discrepancies: consolidated.discrepancy_analysis?.discrepancies || [],
            sources_snapshot: sources || {},
            last_checked_at: new Date(),
            last_meaningful_change_at: new Date(),
            created_by: userId,
            updated_by: userId
        };

        if (record) {
            await record.update(mainPayload, { transaction });
        } else {
            record = await ShipmentTracking.create(mainPayload, { transaction });
        }

        // 2. Insert or Refresh Containers
        if (consolidated.containers && consolidated.containers.length > 0) {
            await ShipmentTrackingContainer.destroy({ where: { tracking_id: record.id }, transaction });
            const containerRows = consolidated.containers.map(c => ({
                tracking_id: record.id,
                container_number: c.container_number,
                container_type: c.container_type || "40HC",
                seal_number: c.seal_number || "N/A",
                status: c.status || effectiveStatus,
                last_location: c.last_location || consolidated.current_location,
                milestones: c.milestones || []
            }));
            await ShipmentTrackingContainer.bulkCreate(containerRows, { transaction });
        }

        // 3. Create Initial Confirmation History Entry
        await ShipmentTrackingHistory.create({
            tracking_id: record.id,
            event_type: "STAFF_CONFIRMED",
            title: "Shipment Tracking Confirmed",
            description: `Staff confirmed multi-source tracking for BL ${cleanBL} with ${consolidated.containers?.length || 0} container(s). Continuous background monitoring activated.`,
            new_status: effectiveStatus,
            new_eta: effectiveEta,
            location: consolidated.current_location,
            coordinates: { latitude: consolidated.latitude, longitude: consolidated.longitude },
            source_attribution: "Staff Verification Engine",
            raw_diff: { overrides: override_values || null }
        }, { transaction });

        // 4. Save Source Logs
        if (sources) {
            const sourceLogs = Object.entries(sources).map(([key, val]) => ({
                tracking_id: record.id,
                source_name: key.toUpperCase(),
                status: val?.success !== false ? "SUCCESS" : "ERROR",
                payload: val,
                fetched_at: new Date()
            }));
            await ShipmentTrackingSourceLog.bulkCreate(sourceLogs, { transaction });
        }

        await transaction.commit();

        writeLogToFile(`[${new Date().toISOString()}] Action: CONFIRM_TRACKING | BL: ${cleanBL} | User: ${userId} | Status: ${effectiveStatus}`, trackingLogPath);

        return await getTrackingById(companyId, record.id);
    } catch (error) {
        await transaction.rollback();
        writeLogToFile(`[${new Date().toISOString()}] Action: CONFIRM_TRACKING_FAILED | Reason: ${error.message}`, trackingLogPath);
        throw error;
    }
};

/**
 * Retrieves all monitored shipments for a company
 */
const getTrackedShipments = async (companyId, queryOptions = {}) => {
    const { page = 1, limit = 10, search = "", status = "", tracking_mode = "" } = queryOptions;
    const offset = (page - 1) * limit;

    const whereClause = { company_id: companyId };

    if (status && status !== "ALL STATUS" && status !== "ALL") {
        whereClause.shipment_status = status;
    }

    if (tracking_mode && tracking_mode !== "ALL") {
        whereClause.tracking_mode = tracking_mode;
    }

    if (search) {
        whereClause[Op.or] = [
            { bl_number: { [Op.iLike]: `%${search}%` } },
            { vessel_name: { [Op.iLike]: `%${search}%` } },
            { shipping_line_name: { [Op.iLike]: `%${search}%` } },
            { voyage_number: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await ShipmentTracking.findAndCountAll({
        where: whereClause,
        include: [
            { model: ShipmentTrackingContainer, as: "containers" }
        ],
        order: [["updated_at", "DESC"]],
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
    });

    return {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / limit),
        data: rows
    };
};

/**
 * Retrieves single tracking record with containers, history, and logs
 */
const getTrackingById = async (companyId, id) => {
    const record = await ShipmentTracking.findOne({
        where: { id, company_id: companyId },
        include: [
            { model: ShipmentTrackingContainer, as: "containers" },
            { model: ShipmentTrackingHistory, as: "history", order: [["created_at", "DESC"]] }
        ]
    });

    if (!record) {
        throw new Error("Tracking record not found.");
    }

    return record;
};

/**
 * Live Refresh for a monitored shipment
 */
const refreshShipmentTracking = async (companyId, id, userId) => {
    const record = await ShipmentTracking.findOne({
        where: { id, company_id: companyId }
    });

    if (!record) throw new Error("Tracking record not found.");

    const aggregated = await aggregateMultiSourceTracking(record.shipping_line_name, record.bl_number);
    const { consolidated, sources } = aggregated;

    const previousStatus = record.shipment_status;
    const previousEta = record.consolidated_eta;
    const previousLocation = record.current_location;

    // Detect Meaningful Changes
    const hasStatusChange = previousStatus !== consolidated.shipment_status;
    const hasLocationChange = previousLocation !== consolidated.current_location;
    const hasEtaChange = previousEta && consolidated.consolidated_eta && Math.abs(new Date(previousEta) - new Date(consolidated.consolidated_eta)) > 6 * 60 * 60 * 1000;

    const isMeaningfulChange = hasStatusChange || hasLocationChange || hasEtaChange;

    const transaction = await sequelize.transaction();
    try {
        await record.update({
            vessel_name: consolidated.vessel_name,
            voyage_number: consolidated.voyage_number,
            current_location: consolidated.current_location,
            latitude: consolidated.latitude,
            longitude: consolidated.longitude,
            speed_knots: consolidated.speed_knots,
            heading: consolidated.heading,
            nav_status: consolidated.nav_status,
            consolidated_eta: consolidated.consolidated_eta,
            carrier_eta: consolidated.carrier_eta,
            port_eta: consolidated.port_eta,
            ais_eta: consolidated.ais_eta,
            shipment_status: consolidated.shipment_status,
            discrepancies: consolidated.discrepancy_analysis?.discrepancies || [],
            sources_snapshot: sources || {},
            last_checked_at: new Date(),
            last_meaningful_change_at: isMeaningfulChange ? new Date() : record.last_meaningful_change_at,
            updated_by: userId
        }, { transaction });

        // If meaningful change occurred, append to history timeline
        if (isMeaningfulChange) {
            await ShipmentTrackingHistory.create({
                tracking_id: record.id,
                event_type: hasStatusChange ? "STATUS_CHANGE" : (hasEtaChange ? "ETA_UPDATE" : "LOCATION_PROGRESS"),
                title: hasStatusChange ? `Status Updated to ${consolidated.shipment_status}` : `Location & ETA Updated`,
                description: `Automated scan detected: Status: ${consolidated.shipment_status}, Location: ${consolidated.current_location}, ETA: ${new Date(consolidated.consolidated_eta).toLocaleDateString()}`,
                previous_status: previousStatus,
                new_status: consolidated.shipment_status,
                previous_eta: previousEta,
                new_eta: consolidated.consolidated_eta,
                location: consolidated.current_location,
                coordinates: { latitude: consolidated.latitude, longitude: consolidated.longitude },
                source_attribution: "Automated Multi-Source Background Scanner"
            }, { transaction });
        }

        await transaction.commit();
        return await getTrackingById(companyId, id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Manual Status / Milestone Override by Staff
 */
const overrideTrackingStatus = async (companyId, id, overrideData, userId) => {
    const record = await ShipmentTracking.findOne({
        where: { id, company_id: companyId }
    });

    if (!record) throw new Error("Tracking record not found.");

    const { status, tracking_mode, notes } = overrideData;

    const previousStatus = record.shipment_status;

    await record.update({
        shipment_status: status || record.shipment_status,
        tracking_mode: tracking_mode || record.tracking_mode,
        updated_by: userId
    });

    await ShipmentTrackingHistory.create({
        tracking_id: record.id,
        event_type: "MANUAL_OVERRIDE",
        title: "Staff Status Override",
        description: notes || `Staff manually modified status from ${previousStatus} to ${status || record.shipment_status}`,
        previous_status: previousStatus,
        new_status: status || record.shipment_status,
        source_attribution: "Staff Override"
    });

    return await getTrackingById(companyId, id);
};

module.exports = {
    fetchLiveTracking,
    confirmTracking,
    getTrackedShipments,
    getTrackingById,
    refreshShipmentTracking,
    overrideTrackingStatus
};
