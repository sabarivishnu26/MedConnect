import express from "express";
import {
  bookAppointment,
  getDoctorAppointments,
  getUserAppointments,
  getDoctorAppointmentsByDate,
  cancelAppointment,
  acceptAppointment,
  rejectAppointment
} from "../controllers/appointmentController.js";
import { authDoctor } from "../middlewares/authDoctor.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/book", authMiddleware, bookAppointment);
router.get("/doctor/:doctorId", authDoctor, getDoctorAppointments);
router.get("/user/:userId", authMiddleware, getUserAppointments);
router.get("/doctor/:doctorId/date/:date", authDoctor, getDoctorAppointmentsByDate);
//router.get("/doctor/date/:date", authDoctor, getDoctorAppointmentsByDate);

// Doctor dashboard actions
router.patch("/:appointmentId/accept", authDoctor, acceptAppointment);
router.patch("/:appointmentId/reject", authDoctor, rejectAppointment);

// User actions
router.patch("/:appointmentId/cancel", authMiddleware, cancelAppointment);
export default router;