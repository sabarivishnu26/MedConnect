import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import connectDB from "./config/mongodb.js";
import { connectRedis } from "./config/redis.js";
import connectCloudinary from "./config/cloudinary.js";
import authRoutes from "./routes/authRoute.js";
import appointmentRoute from "./routes/appointmentRoute.js";
import doctorRoute from "./routes/doctorRoute.js";
import userRoute from "./routes/userRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import Appointment from "./models/appointmentModel.js";
import logger from "./config/logger.js";
import requestLogger from "./middlewares/requestLogger.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.set("trust proxy", 1);

const requiredEnv = ["PORT", "MONGODB_URI", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const PORT = Number(process.env.PORT);
if (!Number.isFinite(PORT)) {
  throw new Error("PORT must be a valid number");
}

const startServer = async () => {
  await connectDB();
  await connectRedis();

  try {
    await Appointment.syncIndexes();
    logger.info("Appointment indexes synced");
  } catch (err) {
    logger.error("Failed to sync appointment indexes", { error: err?.message || String(err) });
  }

  connectCloudinary();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/", (req, res) => {
    res.send("Backend working");
  });


  app.use("/api/auth", authRoutes);
  app.use("/api/appointments", appointmentRoute);
  app.use("/api/doctors", doctorRoute);
  app.use("/api/user", userRoute);
  app.use("/api/payment", paymentRoute);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error("Failed to start server", { error: err.message, stack: err.stack });
  process.exit(1);
});