import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv/config';
import e from 'express';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
//import doctorrouter from './routes/doctorRoute.js';
import authRoutes from "./routes/authRoute.js";
import appointmentRoute from "./routes/appointmentRoute.js";
import doctorRoute from "./routes/doctorRoute.js";
import userRoute from "./routes/userRoute.js";


const app = express();
const PORT = process.env.PORT || 5000;
connectDB()
connectCloudinary

app.use(cors(
    {
  origin: "http://localhost:5173", // your frontend URL
  credentials: true
}
));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

//app.use('/api/doctor', doctorrouter);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoute);
app.use("/api/doctors", doctorRoute);
app.use("/api/user", userRoute);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});