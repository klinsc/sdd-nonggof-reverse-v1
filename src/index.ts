// src/index.ts
import express from "express";
import { Request, Response } from "express";
import { Readable } from "node:stream";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/proxy-sse", async (req: Request, res: Response) => {
  const { input_message, token } = req.query;

  const targetUrl = `${process.env.NEXT_PUBLIC_FASTAPI_URL}/qa/stream?input_message=${encodeURIComponent(
    (input_message as string) || ""
  )}&token=${encodeURIComponent((token as string) || "")}`;

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      res.status(500).send("Upstream SSE failed.");
      return;
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Convert Web Stream to Node stream and pipe to response
    Readable.fromWeb(upstreamResponse.body as any).pipe(res);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Internal SSE proxy error.");
  }
});

// Welcome route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the SSE Proxy Server!");
});

app.listen(PORT, () => {
  console.log(`SSE proxy server running on http://localhost:${PORT}`);
});
