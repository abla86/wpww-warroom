const http = require("node:http");
const path = require("node:path");
const port = Number(process.env.PORT || 8080);
const labUrl = process.env.WPWW_LAB_URL || "http://wpww-lab:8085";

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", "http://gateway.local");
  const normalizedPath = path.posix.normalize(requestUrl.pathname);
  const hasTraversal = normalizedPath.split("/").includes("..");
  if (!normalizedPath.startsWith("/") || hasTraversal) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Invalid request path" }));
    return;
  }

  const target = new URL(labUrl);
  target.pathname = normalizedPath;
  target.search = requestUrl.search;
  try {
    const body = ["POST", "PUT", "PATCH"].includes(req.method || "")
      ? await new Promise((resolve, reject) => {
          const chunks = [];
          req.on("data", (chunk) => chunks.push(chunk));
          req.on("end", () => resolve(Buffer.concat(chunks)));
          req.on("error", reject);
        })
      : undefined;

    const response = await fetch(target, {
      method: req.method,
      headers: { "content-type": req.headers["content-type"] || "application/json" },
      body,
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.arrayBuffer();
    res.statusCode = response.status;
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(Buffer.from(data));
  } catch (error) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({
      status: "UNKNOWN",
      service: "WPWW Gateway",
      error: "Unified lab unavailable",
      detail: error.message,
    }));
  }
});

server.listen(port, () => {
  console.log(`WPWW War Room listening on :${port}`);
});
