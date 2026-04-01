import express from "express";
import {
  bookAppointment,
  getDoctorAppointments,
  getUserAppointments,
  getDoctorAppointmentsByDate,
  cancelAppointment
} from "../controllers/appointmentController.js";
import { authDoctor } from "../middlewares/authDoctor.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/book", authMiddleware, bookAppointment);
router.get("/doctor/:doctorId", getDoctorAppointments);
router.get("/user/:userId", getUserAppointments);
router.get("/doctor/:doctorId/date/:date", getDoctorAppointmentsByDate);
//router.get("/doctor/date/:date", authDoctor, getDoctorAppointmentsByDate);

router.delete("/cancel/:appointmentId", cancelAppointment);
export default router;