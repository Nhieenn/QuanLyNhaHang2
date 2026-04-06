const https = require('https');

const API_KEY = "AIzaSyDnYZksMysBo1d952sFbNiOIwHhphHcyBw";

async function probeGoogleAPI() {
  console.log("--- Probing Google AI REST API (using https) ---");
  
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.error) {
          console.log("❌ [ERROR]:", json.error.message);
          console.log("Details:", JSON.stringify(json.error, null, 2));
        } else if (json.models) {
          console.log("✅ [SUCCESS] Available models found:");
          json.models.slice(0, 10).forEach(m => console.log(`- ${m.name}`));
        } else {
          console.log("⚠️ [UNKNOWN RESPONSE]:", JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.log("❌ [PARSE ERROR]:", e.message);
        console.log("Raw Response:", data);
      }
    });
  }).on('error', (err) => {
    console.log("❌ [NETWORK ERROR]:", err.message);
  });
}

probeGoogleAPI();
