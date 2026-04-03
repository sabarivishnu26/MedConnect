import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import authRoutes from "./routes/authRoute.js";
import appointmentRoute from "./routes/appointmentRoute.js";
import doctorRoute from "./routes/doctorRoute.js";
import userRoute from "./routes/userRoute.js";
import Appointment from "./models/appointmentModel.js";

const app = express();

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

  try {
    await Appointment.syncIndexes();
    console.log("Appointment indexes synced");
  } catch (err) {
    console.error("Failed to sync appointment indexes:", err?.message || err);
  }

  connectCloudinary();
  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    console.log("Request:", req.method, req.url);
    next();
  });

app.get("/", (req, res) => {
  res.send("Backend working");
});


  app.use("/api/auth", authRoutes);
  app.use("/api/appointments", appointmentRoute);
  app.use("/api/doctors", doctorRoute);
  app.use("/api/user", userRoute);
  app.use("/api/doctors", doctorRoute);   // ✅ VERY IMPORTANT

  // start
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});