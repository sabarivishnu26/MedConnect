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
import { cacheResponse } from "../middlewares/cacheMiddleware.js";
import { cacheKeys, CACHE_TTL } from "../utils/cacheKeys.js";

const router = express.Router();

router.post("/book", authMiddleware, bookAppointment);
router.get(
  "/doctor/:doctorId",
  authDoctor,
  cacheResponse({
    keyGenerator: (req) => cacheKeys.doctorAppointments(req.params.doctorId),
    ttlSeconds: CACHE_TTL.APPOINTMENTS,
  }),
  getDoctorAppointments
);
router.get(
  "/user/:userId",
  authMiddleware,
  cacheResponse({
    keyGenerator: (req) => cacheKeys.userAppointments(req.params.userId),
    ttlSeconds: CACHE_TTL.APPOINTMENTS,
  }),
  getUserAppointments
);
router.get(
  "/doctor/:doctorId/date/:date",
  authDoctor,
  cacheResponse({
    keyGenerator: (req) =>
      cacheKeys.doctorAppointmentsByDate(req.params.doctorId, req.params.date),
    ttlSeconds: CACHE_TTL.APPOINTMENTS,
  }),
  getDoctorAppointmentsByDate
);
//router.get("/doctor/date/:date", authDoctor, getDoctorAppointmentsByDate);

// Doctor dashboard actions
router.patch("/:appointmentId/accept", authDoctor, acceptAppointment);
router.patch("/:appointmentId/reject", authDoctor, rejectAppointment);

// User actions
router.patch("/:appointmentId/cancel", authMiddleware, cancelAppointment);
export default router;