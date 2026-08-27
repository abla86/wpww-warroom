const express = require("express");

const app = express();
const port = Number(process.env.PORT || 8080);
const radar = process.env.RADAR_URL || "http://host.docker.internal:5080";
const simulatePath = process.env.SIMULATE_PATH || "/api/v1/internal/legacy-db-dump";
const allowedSimulationPaths = new Set(["/api/v1/internal/legacy-db-dump"]);

const flags = {
  simulator: String(process.env.WPWW_ENABLE_SIMULATOR ?? "true").toLowerCase() === "true",
  telemetry: String(process.env.WPWW_ENABLE_TELEMETRY ?? "false").toLowerCase() === "true",
  ci: String(process.env.WPWW_ENABLE_CI ?? "false").toLowerCase() === "true",
  audio: String(process.env.WPWW_ENABLE_AUDIO ?? "true").toLowerCase() === "true",
  history: String(process.env.WPWW_ENABLE_HISTORY ?? "true").toLowerCase() === "true",
};

let demoMode = false;
let localLockdown = false;
let lastSimulationUtc = null;
const localIncidents = [];
const MAX_INCIDENTS = 100;

function safeSimulationPath() {
  return allowedSimulationPaths.has(simulatePath)
    ? simulatePath
    : "/api/v1/internal/legacy-db-dump";
}

function recordIncident(type, severity = "INFO", details = {}) {
  if (!flags.history) return null;
  const event = {
    eventId: `wpww-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    timestampUtc: new Date().toISOString(),
    mode: demoMode ? "SIMULATED" : "LIVE",
    type,
    severity,
    source: "wpww",
    details,
  };
  localIncidents.unshift(event);
  if (localIncidents.length > MAX_INCIDENTS) localIncidents.length = MAX_INCIDENTS;
  return event;
}

async function requestUpstream(path, options = {}) {
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

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(express.static("public"));

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "Healthy",
    service: "WPWW War Room",
    timestampUtc: new Date().toISOString(),
    mode: demoMode ? "DEMO" : "LIVE",
    lockdown: localLockdown,
  });
});

app.get("/api/warroom", async (_req, res) => {
  const [health, status, events] = await Promise.all([
    requestUpstream("/health"),
    requestUpstream("/api/status"),
    requestUpstream("/api/events"),
  ]);

  const upstreamEvents = Array.isArray(events.body) ? events.body.slice(0, 30) : [];
  const combinedEvents = [...localIncidents, ...upstreamEvents]
    .sort((a, b) => new Date(b.timestampUtc || b.timestamp || 0) - new Date(a.timestampUtc || a.timestamp || 0))
    .slice(0, 50);

  res.json({
    timestampUtc: new Date().toISOString(),
    wpww: {
      mode: demoMode ? "DEMO" : "LIVE",
      lockdown: localLockdown,
      flags,
      lastSimulationUtc,
      historyCount: localIncidents.length,
    },
    radar: {
      health: health.status === 200 ? "UP" : health.status === 0 ? "UNKNOWN" : "DOWN",
      api: status.status === 0 ? "UNKNOWN" : status.ok ? "UP" : "DOWN",
      capabilities: status.body && typeof status.body === "object" ? status.body : {},
      events: combinedEvents,
    },
  });
});

app.get("/api/incidents", (_req, res) => {
  res.json({ mode: demoMode ? "DEMO" : "LIVE", incidents: localIncidents });
});

app.post("/api/mode", (req, res) => {
  const requested = String(req.body?.mode || "LIVE").toUpperCase();
  if (!["LIVE", "DEMO"].includes(requested)) {
    return res.status(400).json({ error: "mode must be LIVE or DEMO" });
  }
  demoMode = requested === "DEMO";
  recordIncident("MODE_CHANGED", "INFO", { mode: requested });
  return res.json({ mode: requested });
});

app.post("/api/simulate", async (_req, res) => {
  if (!flags.simulator) {
    return res.status(409).json({ action: "defensive-probe", enabled: false, error: "Simulator disabled" });
  }

  const path = safeSimulationPath();
  const result = await requestUpstream(path, {
    method: "GET",
    headers: { "User-Agent": "WPWW-Defensive-Simulator/1.0" },
  });

  lastSimulationUtc = new Date().toISOString();
  const eventProduced = [200, 403, 418, 429].includes(result.status);
  recordIncident("CONTROLLED_PROBE", result.status >= 400 ? "WARNING" : "INFO", {
    upstreamStatus: result.status,
    upstreamReached: result.status !== 0,
    eventProduced,
  });

  return res.status(200).json({
    action: "defensive-probe",
    target: "Security Radar controlled route",
    upstreamStatus: result.status,
    upstreamReached: result.status !== 0,
    eventProduced,
    simulationPath: path,
  });
});

app.post("/api/lockdown", (_req, res) => {
  localLockdown = true;
  const incident = recordIncident("LOCAL_LOCKDOWN", "CRITICAL", {
    action: "WPWW local demo state only",
    externalSystemsAffected: false,
  });
  res.json({
    mode: demoMode ? "DEMO" : "LIVE",
    lockdown: true,
    externalSystemsAffected: false,
    incidentId: incident?.eventId || null,
  });
});

app.post("/api/lockdown/reset", (_req, res) => {
  localLockdown = false;
  recordIncident("LOCAL_LOCKDOWN_RESET", "INFO", { externalSystemsAffected: false });
  res.json({ lockdown: false, externalSystemsAffected: false });
});

app.post("/api/history/clear", (_req, res) => {
  if (!flags.history) {
    return res.status(409).json({ error: "History disabled" });
  }
  localIncidents.length = 0;
  res.json({ cleared: true });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found", code: 404 });
});

app.listen(port, () => {
  console.log(`WPWW War Room listening on :${port}`);
});
