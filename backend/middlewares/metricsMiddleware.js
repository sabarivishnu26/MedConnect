import { httpRequestsTotal, httpRequestDuration } from "../metrics.js";

const metricsMiddleware = (req, res, next) => {
  // Skip measuring /metrics and health endpoints to avoid cluttering stats
  if (req.path === "/metrics" || req.path === "/health" || req.path === "/") {
    return next();
  }

  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000; // duration in seconds
    const method = req.method;
    const statusCode = res.statusCode;

    // Use Express route pattern if matched, else fallback
    const route = req.route ? req.baseUrl + req.route.path : (statusCode === 404 ? "not_found" : req.baseUrl + req.path);

    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode,
    });

    httpRequestDuration.observe(
      {
        method,
        route,
        status_code: statusCode,
      },
      duration
    );
  });

  next();
};

export default metricsMiddleware;
