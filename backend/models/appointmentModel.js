import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  reason: { type: String },
  status: { type: String, enum: ["pending", "accepted", "rejected", "cancelled", "paid"], default: "pending" }
}, { timestamps: true });

// Prevent double booking only for ACTIVE appointments.
// (Allows re-booking after an appointment is rejected/cancelled.)
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["pending", "accepted", "paid"] } } }
);

export default mongoose.model("Appointment", appointmentSchema);