import client from "prom-client";

// Collect default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics();

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP Requests",
  labelNames: ["method", "route", "status_code"],
});

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});

export { client };