import {
  bookAppointment,
  getDoctorAppointments,
  getUserAppointments,
  cancelAppointment
} from "../controllers/appointmentcontroller.js";
import express from "express";
const router = express.Router();

router.post("/book", bookAppointment);
router.get("/doctor/:doctorId", getDoctorAppointments);
router.get("/user/:userId", getUserAppointments);
router.delete("/cancel/:appointmentId", cancelAppointment);  
export default router;