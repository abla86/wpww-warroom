const express = require("express");

const app = express();
const port = process.env.PORT || 8080;
const radar = process.env.RADAR_URL || "http://host.docker.internal:5080";
const simulatePath = process.env.SIMULATE_PATH || "/api/v1/internal/legacy-db-dump";

async function get(path, options = {}) {
  try {
    const response = await fetch(`${radar}${path}`, {
      ...options,
      signal: AbortSignal.timeout(4000),
    });
    const text = await response.text();
    let body = null;
    try { body = JSON.parse(text); } catch {}
    return { status: response.status, ok: response.ok, body };
  } catch (error) {
    return { status: 0, ok: false, body: null, error: error.message };
  }
}

app.use(express.static("public"));

app.get("/api/warroom", async (_req, res) => {
  const [health, status, events] = await Promise.all([
    get("/health"),
    get("/api/status"),
    get("/api/events"),
  ]);

  res.json({
    timestampUtc: new Date().toISOString(),
    radar: {
      health: health.status === 200 ? "UP" : health.status === 0 ? "UNKNOWN" : "DOWN",
      api: status.ok ? "UP" : status.status === 0 ? "UNKNOWN" : "DOWN",
      capabilities: status.body,
      events: Array.isArray(events.body) ? events.body.slice(0, 30) : [],
    },
  });
});

app.post("/api/simulate", async (_req, res) => {
  // Intentionally bounded local demonstration. No arbitrary target is accepted.
  const result = await get(simulatePath, {
    method: "GET",
    headers: {
      "User-Agent": "WPWW-Defensive-Simulator/1.0",
    },
  });

  res.status(200).json({
    action: "defensive-probe",
    target: "Security Radar controlled route",
    upstreamStatus: result.status,
    upstreamReached: result.status !== 0,
    eventProduced: result.status === 200 || result.status === 404 || result.status === 418 || result.status === 429,
  });
});

app.listen(port, () => {
  console.log(`WPWW War Room listening on :${port}`);
});
