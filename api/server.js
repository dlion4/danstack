import server from "../dist/server/server.js";

/**
 * Vercel Node.js serverless function adapter for TanStack Start.
 * Bridges Vercel's IncomingMessage/ServerResponse to the Web API fetch handler
 * that TanStack Start's server entry exports.
 */
export default async function handler(req, res) {
  try {
    // Build a Web API Request from Node.js IncomingMessage
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = `${protocol}://${host}${req.url}`;

    // Collect the request body
    let body = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      }
      body = Buffer.concat(chunks);
    }

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          for (const v of value) {
            headers.append(key, v);
          }
        } else {
          headers.set(key, value);
        }
      }
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body,
    });

    // Call TanStack Start's fetch handler
    const response = await server.fetch(request);

    // Bridge the Web API Response back to Node.js ServerResponse
    res.statusCode = response.status;

    // Set response headers
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    // Stream the response body
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }

    res.end();
  } catch (err) {
    console.error("Vercel serverless handler error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>500 - Internal Server Error</h1>");
  }
}
