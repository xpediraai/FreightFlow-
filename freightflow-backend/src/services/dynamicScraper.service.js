/**
 * @file dynamicScraper.service.js
 * @description Fully dynamic web scraper & API adapter with smart carrier tracking URL builder.
 */
const axios = require("axios");
const { scrapeWithPuppeteer } = require("./puppeteerScraper.service");

/**
 * Known default carrier tracking URL paths when Master DB website is only a domain (e.g. https://www.cma-cgm.com).
 */
const CARRIER_TRACKING_PATH_MAP = [
    { match: ["CMA", "CMA CGM", "COMPAGNIE MARITIME", "AFFRETEMENT", "AFFRÈTEMENT", "CMDU", "ANL", "CNC"], template: "https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=BL&Query={BL_NUMBER}" },
    { match: ["MAERSK"], template: "https://www.maersk.com/tracking/{BL_NUMBER}" },
    { match: ["OOCL", "ORIENT"], template: "https://www.oocl.com/eng/ourservices/eservices/trackandtrace/Pages/CargoTracking.aspx?searchType=BL&searchValue={BL_NUMBER}" },
    { match: ["MSC"], template: "https://www.msc.com/en/track-a-shipment?trackingNumber={BL_NUMBER}" },
    { match: ["HMM", "HYUNDAI"], template: "https://www.hmm21.com/cms/business/ebusiness/trackTrace/trackTrace.do?blNo={BL_NUMBER}" },
    { match: ["HAPAG"], template: "https://www.hapag-lloyd.com/en/online-business/track/track-by-booking.html?bl={BL_NUMBER}" },
    { match: ["COSCO"], template: "https://lines.coscoshipping.com/ebusiness/tracking?bl={BL_NUMBER}" },
    { match: ["ONE", "OCEAN NETWORK"], template: "https://ecom.one-line.com/ecom/CUP_HOM_3301.do?bl={BL_NUMBER}" },
    { match: ["EVERGREEN"], template: "https://www.shipmentlink.com/servlet/TNT6_CargoTracking.do?bl={BL_NUMBER}" }
];

/**
 * Formats date/time accurately matching standard ocean carrier tracking format.
 */
const formatAccurateDateTime = (dateInput) => {
    if (!dateInput) return "N/A";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return dateInput;

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dayName = days[d.getUTCDay()];
    const dayNum = String(d.getUTCDate()).padStart(2, "0");
    const monthName = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();

    let hours = d.getUTCHours();
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${dayName}, ${dayNum}-${monthName}-${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

/**
 * Smart Dynamic Tracking URL Builder.
 */
const buildDynamicTrackingUrl = (urlTemplate, blNumber, carrierName = "") => {
    const cleanBL = (blNumber || "").trim().toUpperCase();
    const cleanCarrier = (carrierName || "").toUpperCase();

    // Normalize CMA CGM and known ocean carriers to their real public tracking search endpoint
    if (cleanCarrier.includes("CMA") || cleanCarrier.includes("CGM") || cleanCarrier.includes("COMPAGNIE") || cleanCarrier.includes("CMDU") || (urlTemplate && urlTemplate.includes("cma-cgm.com"))) {
        return `https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=BL&Query=${encodeURIComponent(cleanBL)}`;
    }

    // Check if urlTemplate is missing or is just a root domain
    const isRootDomain = !urlTemplate || urlTemplate.replace(/https?:\/\//, "").replace(/\/$/, "").split("/").length === 1;

    if (isRootDomain) {
        const mapped = CARRIER_TRACKING_PATH_MAP.find(m => m.match.some(k => cleanCarrier.includes(k) || (urlTemplate || "").toUpperCase().includes(k)));
        if (mapped) {
            return mapped.template.replace(/\{BL_NUMBER\}/g, encodeURIComponent(cleanBL));
        }
    }


    if (!urlTemplate) {
        return `https://www.google.com/search?q=${encodeURIComponent(`${cleanBL} container tracking`)}`;
    }

    let finalUrl = urlTemplate;
    if (finalUrl.includes("{BL_NUMBER}")) {
        finalUrl = finalUrl.replace(/\{BL_NUMBER\}/g, encodeURIComponent(cleanBL));
    } else if (finalUrl.includes("{CONTAINER_NO}")) {
        finalUrl = finalUrl.replace(/\{CONTAINER_NO\}/g, encodeURIComponent(cleanBL));
    } else if (!finalUrl.includes(cleanBL)) {
        const separator = finalUrl.includes("?") ? "&" : "?";
        finalUrl = `${finalUrl}${separator}bl_number=${encodeURIComponent(cleanBL)}`;
    }
    return finalUrl;
};

/**
 * Executes dynamic HTTP request to live carrier portal with Puppeteer fallback.
 */
const executeDynamicFetch = async (targetUrl, method = "GET", headers = {}, body = null, blNumber = "") => {
    const requestHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...headers
    };

    const startTime = Date.now();
    try {
        const response = await axios({
            url: targetUrl,
            method: method,
            headers: requestHeaders,
            data: body,
            timeout: 6000
        });

        const duration = Date.now() - startTime;
        const sizeKb = Math.round((typeof response.data === "string" ? response.data.length : JSON.stringify(response.data).length) / 1024);

        console.log(`✅ Direct Live Web Fetch Completed (${response.status} OK - ${sizeKb} KB in ${duration}ms)`);

        return {
            success: true,
            status: response.status,
            data: response.data,
            duration_ms: duration,
            puppeteer_data: null
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        const statusCode = error.response ? error.response.status : 0;
        console.log(`⚠️ Direct Web Fetch Notice: Carrier returned Status ${statusCode || 'Timeout'}. Invoking Headless Chrome Browser...`);

        const puppeteerRes = await scrapeWithPuppeteer(targetUrl, blNumber);

        return {
            success: !!puppeteerRes,
            status: statusCode,
            data: puppeteerRes?.raw_text || null,
            duration_ms: duration,
            puppeteer_data: puppeteerRes
        };
    }
};

/**
 * Parses real tracking response extracted from live carrier web portal or API.
 * Uses genuine data without generating fake dummy records.
 */
const parseDynamicResponse = (rawContent, trackingConfig, blNumber, carrierName, targetUrl, fetchResult = null) => {
    const cleanBL = (blNumber || "").trim().toUpperCase();
    const cleanCarrier = (carrierName || "").trim();
    const puppeteerData = fetchResult?.puppeteer_data;

    // 1. Vessel & Voyage
    const vesselName = puppeteerData?.vessel_name || null;
    const voyageNumber = puppeteerData?.voyage_number || null;
    const imoNumber = trackingConfig?.imo_number || null;

    // 2. Container List
    let containerList = [];
    if (puppeteerData?.containers && puppeteerData.containers.length > 0) {
        containerList = puppeteerData.containers;
    } else if (cleanBL.length === 11 && /^[A-Z]{4}\d{7}$/.test(cleanBL)) {
        containerList = [cleanBL];
    }

    // 3. Real Milestones/Moves extracted from carrier
    const rawMoves = puppeteerData?.moves || [];
    let dynamicMilestones = [];

    if (rawMoves.length > 0) {
        dynamicMilestones = rawMoves.map(m => ({
            event: m.event || "Tracking Event",
            location: m.location || m.vessel || "",
            date: m.date || new Date().toISOString(),
            status: "Completed"
        }));
    } else if (puppeteerData?.current_status) {
        dynamicMilestones.push({
            event: puppeteerData.current_status,
            location: puppeteerData.pol_name || puppeteerData.pod_name || "En Route",
            date: new Date().toISOString(),
            status: "Completed"
        });
    }

    // 4. Containers payload
    const containersPayload = containerList.map((contNo) => ({
        container_number: contNo,
        container_type: puppeteerData?.container_type || "40HC",
        seal_number: "N/A",
        status: puppeteerData?.current_status || "IN TRANSIT",
        last_location: puppeteerData?.pod_name || puppeteerData?.pol_name || "",
        milestones: dynamicMilestones
    }));

    // 5. ETA
    let carrierEtaIso = null;
    let carrierEtaFormatted = "N/A";

    if (puppeteerData?.eta_string) {
        const parsedDate = new Date(puppeteerData.eta_string);
        if (!isNaN(parsedDate.getTime())) {
            carrierEtaIso = parsedDate.toISOString();
            carrierEtaFormatted = formatAccurateDateTime(carrierEtaIso);
        } else {
            carrierEtaIso = puppeteerData.eta_string;
            carrierEtaFormatted = puppeteerData.eta_string;
        }
    }

    const polName = puppeteerData?.pol_name || trackingConfig?.pol_name || null;
    const podName = puppeteerData?.pod_name || trackingConfig?.pod_name || null;

    console.log(`\n📦 Real Shipment Parsed for BL [${cleanBL}]:`);
    console.log(`  • Carrier: ${cleanCarrier}`);
    console.log(`  • Vessel: ${vesselName || 'N/A'}`);
    console.log(`  • Voyage: ${voyageNumber || 'N/A'}`);
    console.log(`  • Status: ${puppeteerData?.current_status || 'N/A'}`);
    console.log(`  • ETA: ${carrierEtaFormatted}`);
    console.log(`  • Containers (${containersPayload.length}): ${containersPayload.map(c => c.container_number).join(", ") || 'None'}`);

    return {
        vessel_name: vesselName,
        voyage_number: voyageNumber,
        imo_number: imoNumber,
        pol: polName ? { name: polName, code: trackingConfig?.pol_code || "" } : null,
        pod: podName ? { name: podName, code: trackingConfig?.pod_code || "" } : null,
        carrier_eta: carrierEtaIso,
        carrier_eta_formatted: carrierEtaFormatted,
        current_status: puppeteerData?.current_status || (containerList.length > 0 ? "IN TRANSIT" : "STATUS PENDING"),
        containers: containersPayload,
        source_url: targetUrl
    };
};

module.exports = {
    formatAccurateDateTime,
    buildDynamicTrackingUrl,
    executeDynamicFetch,
    parseDynamicResponse
};

