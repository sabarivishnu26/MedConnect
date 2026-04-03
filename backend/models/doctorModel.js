import mongoose from "mongoose";

const DEFAULT_IMAGE_URL =
  "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_incoming&w=740&q=80";

const doctorSchema = new mongoose.Schema({

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: DEFAULT_IMAGE_URL },
  clinicPic: { type: String, default: DEFAULT_IMAGE_URL },
  speciality: {type: String, default:""},
  degree: {type: String, default:""},
  experience: {type: String, default:""},
  about: {type: String, default:""},
  available: { type: Boolean, default:true },
  fees: {type: Number, default:0},
  address: { line1: { type: String, default: "" }, line2: { type: String, default: "" } },
  isProfileComplete: { type: Boolean, default: false },
  rating: { type: Number, default:0 },
  date: { type: Date, default: Date.now },
  slots_booked: { type: Object, default: {} }, // Array of booked slots
  // For calendar view
  availability: [
    {
      day: String,      // e.g., "Monday"
      startTime: String, // "09:00"
      endTime: String,   // "17:00"
    }
  ]
}, { timestamps: true,minimize: false });

const doctorModel = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

export default doctorModel;
