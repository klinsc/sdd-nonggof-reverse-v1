import express from "express";
import http from "http";

const app = express();
const PORT = 3000;

// The upstream SSE source
const UPSTREAM_SSE_URL = "http://localhost:4000/events";

app.get("/events", (req, res) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Connect to upstream SSE server
  const upstreamReq = http.get(UPSTREAM_SSE_URL, (upstreamRes) => {
    upstreamRes.on("data", (chunk) => {
      res.write(chunk);
    });

    upstreamRes.on("end", () => {
      res.end();
    });
  });

  upstreamReq.on("error", (err) => {
    console.error("Upstream SSE error:", err.message);
    res.end();
  });

  // Clean up when client disconnects
  req.on("close", () => {
    upstreamReq.destroy();
  });
});

app.listen(PORT, () => {
  console.log(`SSE proxy server listening on http://localhost:${PORT}`);
});
