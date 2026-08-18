/**
 * @file discrepancyEngine.service.js
 * @description Comparison and Discrepancy Detection Engine with simple, clean logs.
 */

const getHoursDifference = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    return Math.abs(d1 - d2) / (1000 * 60 * 60);
};

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
                const severity = diffHours > 24 ? "HIGH" : "MEDIUM";
                discrepancies.push({
                    id: "DISC_ETA_VARIANCE",
                    field: "eta",
                    severity: severity,
                    title: "ETA Variance Detected",
                    description: `Shipping Line ETA differs from Port Berthing ETA by ~${Math.round(diffHours)} hours due to berth queue.`,
                    source_values: {
                        carrier_eta: carrierEta,
                        port_eta: adaniEta || dpwEta,
                        ais_eta: aisEta
                    },
                    suggested_value: adaniEta || carrierEta,
                    suggested_reason: "Port terminal scheduling reflects actual berth docking window"
                });
            }
        }
    }

    // 2. Vessel Name Cross-Check
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

    let confidenceScore = "HIGH";
    if (discrepancies.some(d => d.severity === "HIGH")) {
        confidenceScore = "LOW";
    } else if (discrepancies.length > 0) {
        confidenceScore = "MEDIUM";
    }

    console.log(`\n🔍 Step 3: Discrepancy & Verification Analysis:`);
    if (discrepancies.length > 0) {
        discrepancies.forEach(d => {
            console.log(`  • ${d.title}: ${d.description} (Severity: ${d.severity})`);
        });
    } else {
        console.log(`  • No variances detected across all 4 feeds.`);
    }
    console.log(`  • Confidence Rating: ${confidenceScore}`);

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
