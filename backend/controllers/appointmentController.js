import Appointment from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import mongoose from "mongoose";
import { logAppointmentCreated, logError } from "../utils/logEvents.js";
import { invalidateAppointmentCaches } from "../utils/cacheInvalidation.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const isValidDateYYYYMMDD = (value) => {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isValidTimeHHmm = (value) => {
  if (typeof value !== "string") return false;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return false;
  const [h, m] = value.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
};

const availabilityTimeToMinutes = (value) => {
  if (typeof value !== "string") return null;
  const m = value.trim().match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};

const minutesToHHmm = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const getDayNameFromYYYYMMDD = (yyyyMmDd) => {
  const dt = new Date(`${yyyyMmDd}T00:00:00`); // local time
  return DAY_NAMES[dt.getDay()];
};

const getAllowedTimesForDoctorOnDate = (doctor, dateStr) => {
  const dayName = getDayNameFromYYYYMMDD(dateStr);
  const availability = Array.isArray(doctor?.availability) ? doctor.availability : [];

  const blocks = availability.filter((slot) =>
    typeof slot?.day === "string"
    && slot.day.trim().toLowerCase() === dayName.toLowerCase()
  );

  const allowed = new Set();
  for (const block of blocks) {
    const startMin = availabilityTimeToMinutes(String(block?.startTime || ""));
    const endMin = availabilityTimeToMinutes(String(block?.endTime || ""));
    if (startMin == null || endMin == null) continue;
    if (endMin <= startMin) continue;

    for (let t = startMin; t + 30 <= endMin; t += 30) {
      allowed.add(minutesToHHmm(t));
    }
  }

  return allowed;
};

export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from token

    const { doctorId, doctor, date, time, reason } = req.body;
    const resolvedDoctorId = doctorId || doctor;

    if (!resolvedDoctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date, and time are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(resolvedDoctorId)) {
      return res.status(400).json({ message: "Invalid doctor id" });
    }

    if (!isValidDateYYYYMMDD(date)) {
      return res.status(400).json({ message: "Invalid date format (expected YYYY-MM-DD)" });
    }

    if (!isValidTimeHHmm(time)) {
      return res.status(400).json({ message: "Invalid time format (expected HH:mm)" });
    }

    const doctorDoc = await doctorModel.findById(resolvedDoctorId).select("available availability slots_booked");
    if (!doctorDoc) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    if (doctorDoc.available === false) {
      return res.status(400).json({ message: "Doctor is not available" });
    }

    const allowedTimes = getAllowedTimesForDoctorOnDate(doctorDoc, date);
    if (allowedTimes.size === 0) {
      return res.status(400).json({ message: "Doctor has no availability for the selected day" });
    }
    if (!allowedTimes.has(time)) {
      return res.status(400).json({ message: "Selected time is outside doctor's availability" });
    }

    // Prevent double booking using doctor's slots_booked (fast path)
    const bookedForDate = doctorDoc.slots_booked?.[date];
    if (Array.isArray(bookedForDate) && bookedForDate.includes(time)) {
      return res.status(409).json({ message: "This slot is already booked" });
    }

    // Prevent booking past slots (best-effort, server local time).
    const slotDateTime = new Date(`${date}T${time}:00`);
    if (!Number.isNaN(slotDateTime.getTime()) && slotDateTime < new Date()) {
      return res.status(400).json({ message: "Cannot book a past time slot" });
    }

    // Application-level duplicate check (DB index below is the final safety net).
    // Only ACTIVE appointments should block booking.
    const existing = await Appointment.findOne({
      doctor: resolvedDoctorId,
      date,
      time,
      status: { $in: ["pending", "accepted"] },
    });
    if (existing) {
      return res.status(409).json({ message: "This slot is already booked" });
    }

    let appointment;
    try {
      appointment = await Appointment.create({
        user: userId,
        doctor: resolvedDoctorId,
        date,
        time,
        reason
      });
    } catch (err) {
      // Unique index collision (race condition)
      if (err?.code === 11000) {
        return res.status(409).json({ message: "This slot is already booked" });
      }
      throw err;
    }

    // Persist slot to doctor's slots_booked for UI disabling.
    await doctorModel.updateOne(
      { _id: resolvedDoctorId },
      { $addToSet: { [`slots_booked.${date}`]: time } }
    );

    logAppointmentCreated({
      appointmentId: appointment._id,
      userId,
      doctorId: resolvedDoctorId,
      date,
      time,
    });

    await invalidateAppointmentCaches({
      userId,
      doctorId: resolvedDoctorId,
      date,
    });

    res.status(201).json(appointment);

  } catch (err) {
    logError("Appointment booking error", err, { userId: req.user?.id });
    res.status(400).json({ error: err.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // authDoctor attaches req.doctor; ensure doctor is only accessing own data
    if (!req.doctor) return res.status(401).json({ message: "Unauthorized" });
    if (doctorId !== req.doctor._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const appointments = await Appointment.find({ doctor: req.doctor._id }).populate("user");
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;

    const DEFAULT_IMAGE_URL =
      "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_incoming&w=740&q=80";

    // authMiddleware attaches req.user; ensure user is only accessing own data
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const appointments = await Appointment.find({ user: req.user.id }).populate("doctor");

    // Back-compat: doctor.address used to be a string
    const normalized = appointments.map((appt) => {
      const obj = appt.toObject();
      if (obj.doctor && typeof obj.doctor.address === "string") {
        obj.doctor.address = { line1: obj.doctor.address, line2: "" };
      }
      if (obj.doctor && (!obj.doctor.address || typeof obj.doctor.address !== "object")) {
        obj.doctor.address = { line1: "", line2: "" };
      }

      if (obj.doctor) {
        if (typeof obj.doctor.profilePic !== "string" || !obj.doctor.profilePic.trim()) {
          obj.doctor.profilePic = DEFAULT_IMAGE_URL;
        }
        if (typeof obj.doctor.clinicPic !== "string" || !obj.doctor.clinicPic.trim()) {
          obj.doctor.clinicPic = DEFAULT_IMAGE_URL;
        }
      }
      return obj;
    });

    res.json(normalized);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDoctorAppointmentsByDate = async (req, res) => {
  try {
    // const doctorId = req.doctor._id;    //use atlast

    const { doctorId, date } = req.params;

    if (!req.doctor) return res.status(401).json({ message: "Unauthorized" });
    if (doctorId !== req.doctor._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const appointments = await Appointment.find({ doctor: req.doctor._id, date }).populate("user");
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // authMiddleware attaches req.user
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!["pending", "accepted"].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot cancel a ${appointment.status} appointment` });
    }

    appointment.status = "cancelled";
    await appointment.save();

    // Free the booked slot for that doctor/date.
    await doctorModel.updateOne(
      { _id: appointment.doctor },
      { $pull: { [`slots_booked.${appointment.date}`]: appointment.time } }
    );

    await invalidateAppointmentCaches({
      userId: appointment.user,
      doctorId: appointment.doctor,
      date: appointment.date,
    });

    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const acceptAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    if (!req.doctor) return res.status(401).json({ message: "Unauthorized" });

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: req.doctor._id,
    }).populate("user");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: `Cannot accept a ${appointment.status} appointment` });
    }

    appointment.status = "accepted";
    await appointment.save();

    await invalidateAppointmentCaches({
      userId: appointment.user,
      doctorId: appointment.doctor,
      date: appointment.date,
    });

    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const rejectAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    if (!req.doctor) return res.status(401).json({ message: "Unauthorized" });

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: req.doctor._id,
    }).populate("user");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: `Cannot reject a ${appointment.status} appointment` });
    }

    appointment.status = "rejected";
    await appointment.save();

    // Free slot when rejected.
    await doctorModel.updateOne(
      { _id: appointment.doctor },
      { $pull: { [`slots_booked.${appointment.date}`]: appointment.time } }
    );

    await invalidateAppointmentCaches({
      userId: appointment.user,
      doctorId: appointment.doctor,
      date: appointment.date,
    });

    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
