import logger from "../config/logger.js";

const maskEmail = (email) => {
  if (typeof email !== "string" || !email.includes("@")) return "unknown";
  const [local, domain] = email.split("@");
  const maskedLocal = local.length <= 2 ? "**" : `${local[0]}***${local.at(-1)}`;
  return `${maskedLocal}@${domain}`;
};

export const logHttpRequest = (meta) => {
  logger.info("Incoming request", meta);
};

export const logHttpResponse = (meta) => {
  const level = meta.statusCode >= 500 ? "error" : meta.statusCode >= 400 ? "warn" : "info";
  logger.log(level, "Request completed", meta);
};

export const logAuthSuccess = ({ email, role, userId, ip }) => {
  logger.info("Login successful", {
    event: "auth.login.success",
    email: maskEmail(email),
    role,
    userId: userId?.toString(),
    ip,
  });
};

export const logAuthFailure = ({ email, role, reason, ip }) => {
  logger.warn("Login failed", {
    event: "auth.login.failure",
    email: maskEmail(email),
    role,
    reason,
    ip,
  });
};

export const logAppointmentCreated = ({ appointmentId, userId, doctorId, date, time }) => {
  logger.info("Appointment created", {
    event: "appointment.created",
    appointmentId: appointmentId?.toString(),
    userId: userId?.toString(),
    doctorId: doctorId?.toString(),
    date,
    time,
  });
};

export const logError = (message, error, meta = {}) => {
  logger.error(message, {
    ...meta,
    error: error?.message,
    stack: error?.stack,
  });
};
