import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import authRoutes from "./routes/authRoute.js";
import appointmentRoute from "./routes/appointmentRoute.js";
import doctorRoute from "./routes/doctorRoute.js";
import userRoute from "./routes/userRoute.js";

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();
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