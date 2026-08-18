/**
 * @file discrepancyEngine.service.js
 * @description Comparison and Discrepancy Detection Engine across all tracking sources.
 */

/**
 * Calculates time difference in hours between two date strings
 */
const getHoursDifference = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    return Math.abs(d1 - d2) / (1000 * 60 * 60);
};

/**
 * Evaluates multi-source payloads, detects variances, and outputs structured discrepancy records.
 * 
 * @param {object} carrierData - Result from Shipping Line
 * @param {object} adaniData - Result from Adani Mundra Port
 * @param {object} dpwData - Result from DP World MICT
 * @param {object} aisData - Result from MarineTraffic AIS
 * @returns {object} Discrepancy analysis summary
 */
const analyzeDiscrepancies = (carrierData, adaniData, dpwData, aisData) => {
    const discrepancies = [];

    const carrierEta = carrierData?.carrier_eta;
    const adaniEta = adaniData?.port_eta;
    const dpwEta = dpwData?.port_eta;
    const aisEta = aisData?.ais_eta;

    const carrierNameLabel = `${carrierData?.source_name || carrierData?.shipping_line_name || "Carrier"} (Carrier)`;

    // 1. ETA Cross-Check & Discrepancy
    const etas = [
        { source: carrierNameLabel, value: carrierEta },
        { source: "Adani Mundra Port", value: adaniEta },
        { source: "DP World MICT", value: dpwEta },
        { source: "MarineTraffic AIS", value: aisEta }
    ].filter(e => !!e.value);

    if (etas.length >= 2 && !carrierData?.current_status?.includes("Completed")) {
        const carrierTime = carrierEta ? new Date(carrierEta).getTime() : null;
        const portTime = adaniEta ? new Date(adaniEta).getTime() : (dpwEta ? new Date(dpwEta).getTime() : null);

        if (carrierTime && portTime) {
            const diffHours = getHoursDifference(carrierEta, adaniEta || dpwEta);
            if (diffHours >= 8) {
                discrepancies.push({
                    id: "DISC_ETA_VARIANCE",
                    field: "eta",
                    severity: diffHours > 24 ? "HIGH" : "MEDIUM",
                    title: "ETA Variance Detected",
                    description: `Shipping Line ETA (${new Date(carrierEta).toLocaleDateString()}) differs from Port Berthing ETA (${new Date(adaniEta || dpwEta).toLocaleDateString()}) by ~${Math.round(diffHours)} hours due to berth queue / pilot scheduling.`,
                    source_values: {
                        carrier_eta: carrierEta,
                        port_eta: adaniEta || dpwEta,
                        ais_eta: aisEta
                    },
                    suggested_value: adaniEta || carrierEta,
                    suggested_reason: "Port terminal scheduling generally reflects actual berth docking window"
                });
            }
        }
    }

    // 2. Vessel Name Cross-Check (normalized to handle ocean alliance co-loading prefixes)
    const normalizeVesselName = (name) => {
        if (!name) return "";
        return name
            .toUpperCase()
            .replace(/\b(CMA|CGM|CMA CGM|CMA-CGM|OOCL|MAERSK|MSC|HMM|COSCO|EVERGREEN|EVER|HAPAG|LLOYD|ONE|ZIM|PIL|KMTC|MV|MT|MS|SS)\b/g, "")
            .replace(/[^A-Z0-9]/g, "")
            .trim();
    };

    const carrierVesselNorm = normalizeVesselName(carrierData?.vessel_name);
    const aisVesselNorm = normalizeVesselName(aisData?.vessel_name);

    if (carrierVesselNorm && aisVesselNorm && carrierVesselNorm !== aisVesselNorm && !carrierVesselNorm.includes(aisVesselNorm) && !aisVesselNorm.includes(carrierVesselNorm)) {
        discrepancies.push({
            id: "DISC_VESSEL_MISMATCH",
            field: "vessel_name",
            severity: "HIGH",
            title: "Vessel Name Variance",
            description: `Carrier reports vessel "${carrierData?.vessel_name}" while AIS feed reports "${aisData?.vessel_name}".`,
            source_values: {
                carrier_vessel: carrierData?.vessel_name,
                ais_vessel: aisData?.vessel_name,
                port_vessel: adaniData?.vessel_name
            },
            suggested_value: carrierData?.vessel_name,
            suggested_reason: "Master Bill of Lading manifests carry primary legal authority"
        });
    }

    // 3. Voyage Number Cross-Check
    const carrierVoyage = (carrierData?.voyage_number || "").toUpperCase().trim();
    const portVoyage = (adaniData?.inward_voyage || dpwData?.voyage_number || "").toUpperCase().trim();

    if (carrierVoyage && portVoyage && carrierVoyage !== portVoyage && !portVoyage.includes(carrierVoyage)) {
        discrepancies.push({
            id: "DISC_VOYAGE_MISMATCH",
            field: "voyage_number",
            severity: "LOW",
            title: "Inward Voyage Formatting Notice",
            description: `Carrier voyage "${carrierVoyage}" matches Port Inward Schedule "${portVoyage}".`,
            source_values: {
                carrier_voyage: carrierVoyage,
                port_inward_voyage: portVoyage
            },
            suggested_value: carrierVoyage
        });
    }

    // 4. Determine Overall Confidence Score
    let confidenceScore = "HIGH";
    if (discrepancies.some(d => d.severity === "HIGH")) {
        confidenceScore = "LOW";
    } else if (discrepancies.length > 0) {
        confidenceScore = "MEDIUM";
    }

    return {
        has_discrepancies: discrepancies.length > 0,
        discrepancies_count: discrepancies.length,
        confidence_score: confidenceScore,
        discrepancies
    };
};

module.exports = {
    analyzeDiscrepancies
};
