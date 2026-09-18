/**
 * @file puppeteerScraper.service.js
 * @description Headless Browser Scraper using Puppeteer to bypass 403 Forbidden / Cloudflare and extract real DOM elements.
 */
let puppeteer = null;
try {
    puppeteer = require("puppeteer");
} catch (e) {
    // Lazy load fallback if puppeteer is still installing
}

/**
 * Scrapes live carrier portal using Headless Chromium browser.
 * 
 * @param {string} targetUrl - Carrier tracking URL
 * @param {string} blNumber - Master or House BL Number
 * @returns {Promise<object|null>} Parsed real DOM payload
 */
/**
 * Scrapes live carrier portal using Headless Chromium browser.
 * Extracts real container numbers, vessel name, voyage, POL, POD, status, ETA, and moves.
 * 
 * @param {string} targetUrl - Carrier tracking URL
 * @param {string} blNumber - Master or House BL Number / Booking Number
 * @returns {Promise<object|null>} Real extracted tracking data or null
 */
const scrapeWithPuppeteer = async (targetUrl, blNumber) => {
    if (!puppeteer) {
        try {
            puppeteer = require("puppeteer");
        } catch (e) {
            console.log(`⚠️ Puppeteer module not available.`);
            return null;
        }
    }

    const cleanBL = (blNumber || "").trim().toUpperCase();
    console.log(`\n==================================================`);
    console.log(`🤖 [PUPPETEER] Launching Headless Chrome Browser...`);
    console.log(`  -> Target URL: ${targetUrl}`);
    console.log(`  -> Query: ${cleanBL}`);

    let browser = null;
    const startTime = Date.now();

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--window-size=1920,1080",
                "--disable-blink-features=AutomationControlled"
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
        await page.setViewport({ width: 1920, height: 1080 });

        // Evaluate stealth script to avoid detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        let capturedApiJson = null;

        // Intercept any background JSON responses from carrier API
        page.on('response', async (response) => {
            try {
                const url = response.url().toLowerCase();
                const contentType = response.headers()['content-type'] || '';
                if (contentType.includes('application/json') && (url.includes('tracking') || url.includes('shipment') || url.includes('container') || url.includes('search'))) {
                    const json = await response.json().catch(() => null);
                    if (json && (json.containers || json.moves || json.events || json.data || json.vessel || json.routing)) {
                        capturedApiJson = json;
                    }
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });

        console.log(`  -> Navigating to page & waiting for DOM render...`);
        const response = await page.goto(targetUrl, {
            waitUntil: "networkidle2",
            timeout: 30000
        });

        const status = response ? response.status() : 200;
        console.log(`  [PUPPETEER_RESPONSE] Status Code: ${status} (${Date.now() - startTime}ms)`);

        // Wait brief delay for SPA JavaScript/hydration to complete
        await new Promise(r => setTimeout(r, 2500));

        // Extract DOM elements
        const extracted = await page.evaluate((cleanBL) => {
            const pageText = document.body.innerText || "";
            const html = document.body.innerHTML || "";

            // 1. Container Numbers
            const bicContainers = [...new Set(pageText.match(/\b[A-Z]{4}\d{7}\b/g) || [])];
            
            // Container Type matching (e.g. 40HC, 45G1, 20GP, 40GP, 40HQ)
            const typeMatch = pageText.match(/\b(20GP|40GP|40HC|45G1|40HQ|22G1|42G1|45R1|40HR)\b/i);
            const containerType = typeMatch ? typeMatch[1].toUpperCase() : null;

            // 2. Vessel Name
            let vessel = null;
            const vesselMatch = pageText.match(/Vessel\s*:?\s*([A-Z0-9\s\.\-]+)/i) || 
                                pageText.match(/Vessel Name\s*:?\s*([A-Z0-9\s\.\-]+)/i);
            if (vesselMatch && vesselMatch[1]) {
                vessel = vesselMatch[1].split("\n")[0].replace(/Voyage.*/i, "").trim();
            }

            // 3. Voyage Number
            let voyage = null;
            const voyageMatch = pageText.match(/Voyage\s*:?\s*([A-Z0-9]+)/i);
            if (voyageMatch && voyageMatch[1]) {
                voyage = voyageMatch[1].split("\n")[0].trim();
            }

            // 4. Booking Reference
            let bookingRef = null;
            const bookingMatch = pageText.match(/Booking\s*(?:reference|ref|number|no)?\s*:?\s*([A-Z0-9]+)/i);
            if (bookingMatch && bookingMatch[1]) {
                bookingRef = bookingMatch[1].trim();
            }

            // 5. POL (Port of Loading)
            let polName = null;
            const polMatch = pageText.match(/POL\s*\n*\s*([A-Za-z0-9\s,\(\)]+)/i) || 
                             pageText.match(/Port of Loading\s*:?\s*([A-Za-z0-9\s,\(\)]+)/i);
            if (polMatch && polMatch[1]) {
                polName = polMatch[1].split("\n")[0].trim();
            }

            // 6. POD (Port of Discharge)
            let podName = null;
            const podMatch = pageText.match(/POD\s*\n*\s*([A-Za-z0-9\s,\(\)]+)/i) || 
                             pageText.match(/Port of Discharge\s*:?\s*([A-Za-z0-9\s,\(\)]+)/i) ||
                             pageText.match(/ETA Berth at POD\s*\n*\s*([A-Za-z0-9\s,\(\)]+)/i);
            if (podMatch && podMatch[1]) {
                podName = podMatch[1].split("\n")[0].trim();
            }

            // 7. Status badge
            let currentStatus = null;
            const statusMatch = pageText.match(/\b(VESSEL DEPARTURE|LOADED ON BOARD|IN TRANSIT|GATE IN|GATE OUT|DISCHARGED|DELIVERED|BOOKING CONFIRMED)\b/i);
            if (statusMatch && statusMatch[1]) {
                currentStatus = statusMatch[1].toUpperCase();
            }

            // 8. ETA
            let eta = null;
            const etaMatch = pageText.match(/ETA(?:\s*Berth)?(?:\s*at\s*POD)?\s*:?\s*([A-Za-z0-9\s,:\-]+)/i);
            if (etaMatch && etaMatch[1]) {
                eta = etaMatch[1].split("\n")[0].replace(/\d+\s*DAYS\s*REMAINING.*/i, "").trim();
            }

            // 9. Moves Table Extraction
            const moves = [];
            const rows = document.querySelectorAll("table tr, .tracking-row, .move-row, .timeline-item");
            rows.forEach(r => {
                const text = r.innerText?.trim();
                if (text && (text.includes("Loaded") || text.includes("Gate") || text.includes("Departure") || text.includes("Discharged") || text.includes("Arrival") || text.includes("Empty"))) {
                    const cells = r.querySelectorAll("td, th, div");
                    if (cells.length >= 2) {
                        moves.push({
                            date: cells[0]?.innerText?.trim() || "",
                            event: cells[1]?.innerText?.trim() || "",
                            location: cells[2]?.innerText?.trim() || "",
                            vessel: cells[3]?.innerText?.trim() || ""
                        });
                    }
                }
            });

            return {
                pageText,
                containers: bicContainers,
                containerType,
                vessel,
                voyage,
                bookingRef,
                polName,
                podName,
                currentStatus,
                eta,
                moves
            };
        }, cleanBL);

        await browser.close();

        console.log(`  [PUPPETEER_DOM_EXTRACTED]:`);
        console.log(`    • Vessel: ${extracted.vessel || 'N/A'}`);
        console.log(`    • Voyage: ${extracted.voyage || 'N/A'}`);
        console.log(`    • Containers: ${extracted.containers?.join(", ") || 'None'}`);
        console.log(`    • Status: ${extracted.currentStatus || 'N/A'}`);
        console.log(`    • ETA: ${extracted.eta || 'N/A'}`);
        console.log(`    • Moves found: ${extracted.moves?.length || 0}`);
        console.log(`==================================================\n`);

        return {
            success: true,
            vessel_name: extracted.vessel,
            voyage_number: extracted.voyage,
            booking_ref: extracted.bookingRef,
            containers: extracted.containers,
            container_type: extracted.containerType,
            pol_name: extracted.polName,
            pod_name: extracted.podName,
            current_status: extracted.currentStatus,
            eta_string: extracted.eta,
            moves: extracted.moves,
            captured_json: capturedApiJson,
            raw_text: extracted.pageText
        };
    } catch (err) {
        console.log(`⚠️ [PUPPETEER_ERROR] Scrape failed: ${err.message}`);
        if (browser) await browser.close().catch(() => {});
        return null;
    }
};

module.exports = {
    scrapeWithPuppeteer
};

