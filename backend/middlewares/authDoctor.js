import jwt from "jsonwebtoken";
import Doctor from "../models/doctorModel.js";

export const authDoctor = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(decoded.id);
    if (!doctor) return res.status(401).json({ error: "Doctor not found" });
    req.doctor = doctor;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};