/**
 * @file trackingAggregator.service.js
 * @description Master Aggregator coordinating parallel multi-source tracking with accurate date formatting.
 */

const { fetchCarrierTracking } = require("./carrierTracker.service");
const { fetchAdaniMundraTracking, fetchDpWorldMictTracking } = require("./portTracker.service");
const { fetchAisTracking } = require("./aisTracker.service");
const { analyzeDiscrepancies } = require("./discrepancyEngine.service");
const { formatAccurateDateTime } = require("../../../../services/dynamicScraper.service");
const ShippingLine = require("../../../Masters/Logistics/ShippingLineMasters/shippingLine.model");

/**
 * Aggregates tracking data from all 4 sources in parallel with clean log formatting.
 */
const aggregateMultiSourceTracking = async (shippingLineName, blNumber, shippingLineId = null) => {
    const cleanBL = (blNumber || "").trim().toUpperCase();

    console.log(`\n==================================================`);
    console.log(`🚀 [TRACKING ENGINE] Multi-Source Scan Initiated`);
    console.log(`-> BL Number: ${cleanBL}`);
    console.log(`-> Shipping Line: ${shippingLineName || 'N/A'}`);
    console.log(`==================================================`);

    let masterWebsiteUrl = null;
    try {
        if (shippingLineId) {
            const masterRec = await ShippingLine.findByPk(shippingLineId);
            if (masterRec?.website) masterWebsiteUrl = masterRec.website;
        } else if (shippingLineName) {
            const masterRec = await ShippingLine.findOne({ where: { shipping_line_name: shippingLineName } });
            if (masterRec?.website) masterWebsiteUrl = masterRec.website;
        }
    } catch (e) {
        // Silent catch
    }

    // 1. Dynamic Carrier Fetch
    const carrierRes = await fetchCarrierTracking(shippingLineName, cleanBL, masterWebsiteUrl);

    const vesselName = carrierRes?.vessel_name || null;
    const voyageNumber = carrierRes?.voyage_number || null;
    const imoNumber = carrierRes?.imo_number || null;

    // 2. Parallel Secondary Fetches (Port, AIS)
    const [adaniSettled, dpwSettled, aisSettled] = await Promise.allSettled([
        fetchAdaniMundraTracking(vesselName, voyageNumber, cleanBL),
        fetchDpWorldMictTracking(vesselName, voyageNumber, cleanBL),
        fetchAisTracking(vesselName, imoNumber)
    ]);

    const adaniRes = adaniSettled.status === "fulfilled" ? adaniSettled.value : { success: false };
    const dpwRes = dpwSettled.status === "fulfilled" ? dpwSettled.value : { success: false };
    const aisRes = aisSettled.status === "fulfilled" ? aisSettled.value : { success: false };

    console.log(`\n⚓ Step 2: Checking Berthing & Satellite Radar Feeds...`);
    if (adaniRes.success && adaniRes.port_eta) {
        console.log(`  • Adani Mundra Port: ETA ${formatAccurateDateTime(adaniRes.port_eta)} (${adaniRes.berth_number || 'TBD'})`);
    }
    if (dpwRes.success && dpwRes.port_eta) {
        console.log(`  • DP World MICT: ETA ${formatAccurateDateTime(dpwRes.port_eta)} (${dpwRes.terminal})`);
    }
    if (aisRes.success && aisRes.latitude) {
        console.log(`  • MarineTraffic AIS: Coordinates ${aisRes.latitude}° N, ${aisRes.longitude}° E (${aisRes.speed_knots} knots)`);
    }

    // 3. Run Discrepancy & Verification Engine
    const discrepancyAnalysis = analyzeDiscrepancies(carrierRes, adaniRes, dpwRes, aisRes);

    // 4. Determine Best Consolidated Fields
    const carrierEta = carrierRes?.carrier_eta;
    const portEta = adaniRes?.port_eta || dpwRes?.port_eta;
    const aisEta = aisRes?.ais_eta;
    const consolidatedEta = portEta || carrierEta || aisEta;

    const consolidated = {
        bl_number: cleanBL,
        shipping_line_name: carrierRes?.source_name || shippingLineName || "Carrier",
        shipping_line_code: carrierRes?.shipping_line_code || "CARRIER",
        vessel_name: vesselName,
        voyage_number: voyageNumber,
        imo_number: imoNumber,
        pol: carrierRes?.pol || null,
        pod: carrierRes?.pod || null,
        current_location: aisRes?.current_location || carrierRes?.pod?.name || carrierRes?.pol?.name || "In Transit",
        latitude: aisRes?.latitude || null,
        longitude: aisRes?.longitude || null,
        speed_knots: aisRes?.speed_knots || null,
        heading: aisRes?.heading || null,
        nav_status: aisRes?.nav_status || "Underway",
        shipment_status: carrierRes?.current_status || "IN TRANSIT",
        consolidated_eta: consolidatedEta,
        carrier_eta: carrierEta,
        port_eta: portEta,
        ais_eta: aisEta,
        containers_count: carrierRes?.containers?.length || 0,
        containers: carrierRes?.containers || [],
        discrepancy_analysis: discrepancyAnalysis,
        last_scraped_at: new Date().toISOString()
    };

    console.log(`==================================================\n`);

    return {
        success: true,
        consolidated,
        sources: {
            carrier: carrierRes,
            adani_mundra: adaniRes,
            dp_world: dpwRes,
            marine_traffic_ais: aisRes
        }
    };
};

module.exports = {
    aggregateMultiSourceTracking
};
