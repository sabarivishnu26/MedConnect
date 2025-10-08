import express from "express";
import {
  bookAppointment,
  getDoctorAppointments,
  getUserAppointments,
  getDoctorAppointmentsByDate
} from "../controllers/appointmentController.js";
import { authDoctor } from "../middlewares/authDoctor.js";

const router = express.Router();

router.post("/book", bookAppointment);
router.get("/doctor/:doctorId", getDoctorAppointments);
router.get("/user/:userId", getUserAppointments);
router.get("/doctor/:doctorId/date/:date", getDoctorAppointmentsByDate);
//router.get("/doctor/date/:date", authDoctor, getDoctorAppointmentsByDate);

export default router;