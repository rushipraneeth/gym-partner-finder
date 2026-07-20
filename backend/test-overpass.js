import https from "https";

const lat = 40.7128;
const lon = -74.0060;
const query = `[out:json];node(around:5000,${lat},${lon})["leisure"="fitness_centre"];out;`;
const postData = `data=${encodeURIComponent(query)}`;

const options = {
  hostname: 'overpass-api.de',
  port: 443,
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (apiRes) => {
  let data = '';

  apiRes.on('data', (chunk) => {
    data += chunk;
  });

  apiRes.on('end', () => {
    console.log(`Status: ${apiRes.statusCode}`);
    if (apiRes.statusCode !== 200) {
      console.log(data);
    } else {
      console.log("Success! Gyms found:", JSON.parse(data).elements.length);
    }
  });
});

req.on('error', (err) => {
  console.error("Error:", err.message);
});

req.write(postData);
req.end();
