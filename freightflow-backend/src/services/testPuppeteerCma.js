const axios = require("axios");

async function testPublicCarrierSearch(bl) {
    console.log(`Testing Public Carrier Live Search for BL: ${bl}`);

    // Test 1: Direct Carrier Portal Tracking Endpoint
    const carrierUrl = `https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=BL&Query=${bl}`;
    console.log(`1. Testing Carrier Portal: ${carrierUrl}`);

    // Test 2: Public Logistics Tracker Endpoint
    const trackerUrl = `https://api.searates.com/v2/tracking?number=${bl}`;
    console.log(`2. Testing Public Tracker: ${trackerUrl}`);

    try {
        const res = await axios.get(`https://www.track-trace.com/container`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }
        });
        console.log(`Track-Trace Status: ${res.status}`);
    } catch (e) {
        console.log(`Track-Trace Error: ${e.message}`);
    }
}

testPublicCarrierSearch("QGD3237299");
