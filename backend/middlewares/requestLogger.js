import { logHttpRequest, logHttpResponse } from "../utils/logEvents.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();

  logHttpRequest({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.on("finish", () => {
    logHttpResponse({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
    });
  });

  next();
};

export default requestLogger;
