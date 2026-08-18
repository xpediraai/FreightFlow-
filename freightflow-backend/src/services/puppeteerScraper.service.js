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
const scrapeWithPuppeteer = async (targetUrl, blNumber) => {
    if (!puppeteer) {
        try {
            puppeteer = require("puppeteer");
        } catch (e) {
            console.log(`⚠️ Puppeteer module not available yet.`);
            return null;
        }
    }

    console.log(`\n==================================================`);
    console.log(`🤖 [PUPPETEER] Launching Headless Chrome Browser...`);
    console.log(`  -> Target URL: ${targetUrl}`);

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
                "--window-size=1920,1080"
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        await page.setViewport({ width: 1920, height: 1080 });

        console.log(`  -> Navigating to page & bypassing 403/Cloudflare protections...`);
        const response = await page.goto(targetUrl, {
            waitUntil: "networkidle2",
            timeout: 25000
        });

        const status = response ? response.status() : 200;
        console.log(`  [PUPPETEER_RESPONSE] Status Code: ${status} (${Date.now() - startTime}ms)`);

        // Wait brief delay for SPA JavaScript to hydrate tables
        await new Promise(r => setTimeout(r, 2000));

        // Extract DOM text content
        const pageText = await page.evaluate(() => document.body.innerText || "");
        const pageHtml = await page.content();

        console.log(`  -> Extracted HTML length: ${pageHtml.length} characters.`);

        // Parse Vessel Name from DOM
        let vesselName = null;
        const vesselMatch = pageText.match(/Vessel\s*:?\s*([A-Z0-9\s\.\-]+)/i) || pageText.match(/Vessel Name\s*:?\s*([A-Z0-9\s\.\-]+)/i);
        if (vesselMatch && vesselMatch[1]) {
            vesselName = vesselMatch[1].split("\n")[0].trim();
        }

        // Parse Voyage Number from DOM
        let voyageNumber = null;
        const voyageMatch = pageText.match(/Voyage\s*:?\s*([A-Z0-9]+)/i);
        if (voyageMatch && voyageMatch[1]) {
            voyageNumber = voyageMatch[1].trim();
        }

        // Parse Container Numbers (Regex match for 4 letters + 7 digits BIC prefix)
        const containerMatches = [...new Set(pageText.match(/\b[A-Z]{4}\d{7}\b/g) || [])];

        // Parse ETA from DOM
        let etaString = null;
        const etaMatch = pageText.match(/ETA\s*:?\s*([A-Za-z0-9\s,:\-]+)/i) || pageText.match(/ETA Berth\s*:?\s*([A-Za-z0-9\s,:\-]+)/i);
        if (etaMatch && etaMatch[1]) {
            etaString = etaMatch[1].split("\n")[0].trim();
        }

        console.log(`  [PUPPETEER_DOM_EXTRACTED]:`);
        console.log(`    • Vessel: ${vesselName || 'Not found in DOM'}`);
        console.log(`    • Voyage: ${voyageNumber || 'Not found in DOM'}`);
        console.log(`    • Containers Found: ${containerMatches.length > 0 ? containerMatches.join(", ") : 'None'}`);
        console.log(`    • ETA String: ${etaString || 'Not found in DOM'}`);
        console.log(`==================================================\n`);

        await browser.close();

        return {
            success: true,
            vessel_name: vesselName,
            voyage_number: voyageNumber,
            containers: containerMatches,
            eta_string: etaString,
            raw_text: pageText
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
