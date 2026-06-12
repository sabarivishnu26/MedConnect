import logger from "../config/logger.js";

export const notFoundHandler = (req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  logger.error("Unhandled exception", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    message: statusCode === 404 ? err.message : "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { error: err.message }),
  });
};
