const express = require("express");

const app = express();
const port = process.env.PORT || 8080;
const radarUrl = process.env.RADAR_URL || "http://host.docker.internal:5080";

async function fetchJson(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const text = await response.text();
    let body = null;
    try { body = JSON.parse(text); } catch {}
    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    return { ok: false, status: 0, body: null, error: error.message };
  }
}

app.use(express.static("public"));

app.get("/api/warroom", async (_req, res) => {
  const health = await fetchJson(`${radarUrl}/health`);
  const status = await fetchJson(`${radarUrl}/api/status`);
  const events = await fetchJson(`${radarUrl}/api/events`);

  res.json({
    timestampUtc: new Date().toISOString(),
    radar: {
      health: health.status === 200 ? "UP" : "DOWN",
      status: status.ok ? "UP" : "UNKNOWN",
      capabilities: status.body || null,
      events: Array.isArray(events.body) ? events.body.slice(0, 20) : []
    }
  });
});

app.listen(port, () => {
  console.log(`WPWW War Room listening on http://localhost:${port}`);
});
