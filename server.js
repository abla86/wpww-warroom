const http = require("node:http");
const port = Number(process.env.PORT || 8080);
const labUrl = process.env.WPWW_LAB_URL || "http://wpww-lab:8085";
const maxBodyBytes = 1024 * 1024;
const labHost = new URL(labUrl).hostname;

function sanitizeProxyPath(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    return null;
  }

  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (
    decoded.includes("..") ||
    decoded.includes("\\") ||
    /%2f|%5c/i.test(pathname)
  ) {
    return null;
  }

  if (!/^\/[A-Za-z0-9/_\-\.]*$/.test(decoded)) {
    return null;
  }

  return decoded;
}

const server = http.createServer(async (req, res) => {
  if (req.headers.host && req.headers.host.length > 255) {
    res.statusCode = 400;
    return res.end("Invalid Host header");
  }
  const requestUrl = new URL(req.url || "/", "http://gateway.local");
  const safePath = sanitizeProxyPath(requestUrl.pathname);
  if (!safePath) {
    res.statusCode = 400;
    return res.end("Invalid request path");
  }
  const target = new URL(`${safePath}${requestUrl.search}`, labUrl);
  if (target.hostname !== labHost) {
    res.statusCode = 400;
    return res.end("Invalid upstream target");
  }
  try {
    const body = ["POST", "PUT", "PATCH"].includes(req.method || "")
      ? await new Promise((resolve, reject) => {
          const chunks = [];
          let total = 0;
          req.on("data", (chunk) => {
            total += chunk.length;
            if (total > maxBodyBytes) {
              reject(new Error("Request body too large."));
              req.destroy();
              return;
            }
            chunks.push(chunk);
          });
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
