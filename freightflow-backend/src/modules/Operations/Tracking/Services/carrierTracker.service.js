/**
 * @file carrierTracker.service.js
 * @description Dynamic Shipping Line tracking adapter driven by Shipping Line Master DB & Puppeteer 403 bypass.
 */
const ShippingLine = require("../../../Masters/Logistics/ShippingLineMasters/shippingLine.model");
const { buildDynamicTrackingUrl, executeDynamicFetch, parseDynamicResponse } = require("../../../../services/dynamicScraper.service");

/**
 * Fetches real-time tracking data dynamically from carrier website URLs.
 */
const fetchCarrierTracking = async (shippingLineName, blNumber, masterWebsiteUrl = null) => {
    const cleanBL = (blNumber || "").trim().toUpperCase();
    const cleanLine = (shippingLineName || "").trim();

    let shippingLineMaster = null;
    try {
        if (cleanLine) {
            shippingLineMaster = await ShippingLine.findOne({
                where: { shipping_line_name: cleanLine }
            });
        }
    } catch (dbErr) {
        // Silent fallback
    }

    const trackingUrlTemplate = shippingLineMaster?.tracking_url || masterWebsiteUrl || shippingLineMaster?.website;
    const trackingConfig = shippingLineMaster?.tracking_config || {};
    const carrierCode = shippingLineMaster?.shipping_line_code || shippingLineMaster?.scac_code || cleanLine.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase() || "LINE";
    const carrierName = shippingLineMaster?.shipping_line_name || cleanLine || "Shipping Line";

    const targetUrl = buildDynamicTrackingUrl(trackingUrlTemplate, cleanBL, carrierName);

    console.log(`📡 Step 1: Fetching live data for ${carrierName} from ${targetUrl}...`);

    const fetchResult = await executeDynamicFetch(targetUrl, "GET", {}, null, cleanBL);
    const parsedData = parseDynamicResponse(fetchResult.data, trackingConfig, cleanBL, carrierName, targetUrl, fetchResult);

    return {
        success: true,
        source: "CARRIER_WEB_PORTAL",
        source_name: carrierName,
        shipping_line_code: carrierCode,
        shipping_line_name: carrierName,
        bl_number: cleanBL,
        vessel_name: parsedData.vessel_name,
        voyage_number: parsedData.voyage_number,
        imo_number: parsedData.imo_number,
        pol: parsedData.pol,
        pod: parsedData.pod,
        carrier_eta: parsedData.carrier_eta,
        current_status: parsedData.current_status,
        containers: parsedData.containers,
        source_url: targetUrl,
        raw_source: `Live Dynamic Scan (${targetUrl})`,
        fetched_at: new Date().toISOString()
    };
};

module.exports = {
    fetchCarrierTracking
};
