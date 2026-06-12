/*import validator from "validator"
import bcrypt from "bcrypt"
const registerDoctor = async (req,res) => {
    try {
        const {name,email,password,speciality,degree,experience,about,fees,address} = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!validator.isEmail(email)) {
            res.json({success: false, message: "Please enter a valid email"});
        }
        if (password.length < 8) {
            res.json({success: false, message: "Password must be at least 6 characters long"});
        }

        const 
                                                                                        
    } catch (error) {
        
    }


export {registerDoctor};*/

import doctorModel from "../models/doctorModel.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { pickEnv } from "../utils/env.js";
import { invalidateDoctorCache } from "../utils/cacheInvalidation.js";

const DEFAULT_IMAGE_URL =
  "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_incoming&w=740&q=80";

const normalizeDoctorAddress = (doctor) => {
  if (!doctor) return doctor;
  const obj = typeof doctor.toObject === "function" ? doctor.toObject() : { ...doctor };

  if (typeof obj.address === "string") {
    obj.address = { line1: obj.address, line2: "" };
  }
  if (!obj.address || typeof obj.address !== "object") {
    obj.address = { line1: "", line2: "" };
  }
  obj.address.line1 = obj.address.line1 || "";
  obj.address.line2 = obj.address.line2 || "";

  // Ensure new schema fields always exist in API responses.
  if (typeof obj.profilePic !== "string" || !obj.profilePic.trim()) {
    obj.profilePic = DEFAULT_IMAGE_URL;
  }
  if (typeof obj.clinicPic !== "string" || !obj.clinicPic.trim()) {
    obj.clinicPic = DEFAULT_IMAGE_URL;
  }

  return obj;
};

const isDoctorProfileComplete = (doctor) => {
  if (!doctor) return false;

  const nameOk = Boolean(doctor.name && String(doctor.name).trim());
  const specialityOk = Boolean(doctor.speciality && String(doctor.speciality).trim());
  const experienceOk = Boolean(doctor.experience && String(doctor.experience).trim());
  const feesOk = typeof doctor.fees === "number" ? doctor.fees > 0 : Number(doctor.fees) > 0;
  const aboutOk = Boolean(doctor.about && String(doctor.about).trim());
  const addressLine1Ok = Boolean(doctor.address?.line1 && String(doctor.address.line1).trim());

  const availabilityOk = Array.isArray(doctor.availability)
    && doctor.availability.length > 0
    && doctor.availability.every((slot) =>
      slot
      && String(slot.day || "").trim()
      && String(slot.startTime || "").trim()
      && String(slot.endTime || "").trim()
    );

  return nameOk && specialityOk && experienceOk && feesOk && aboutOk && addressLine1Ok && availabilityOk;
};

// Get doctor profile by ID
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(normalizeDoctorAddress(doctor));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDoctorProfile = async (req, res) => {
  try {
    if (!req.doctor) return res.status(401).json({ message: "Unauthorized" });

    const doctor = await doctorModel.findById(req.doctor._id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(normalizeDoctorAddress(doctor));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile by ID
export const updateDoctorProfile = async (req, res) => {
  try {
    // authDoctor attaches req.doctor
    if (!req.doctor) return res.status(401).json({ message: "Unauthorized" });
    if (req.params.id !== req.doctor._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Only allow updating whitelisted fields (avoid password changes without hashing, etc.)
    const allowedFields = [
      "name",
      "email",
      "profilePic",
      "clinicPic",
      "speciality",
      "degree",
      "experience",
      "about",
      "available",
      "fees",
      "address",
      "availability",
      "slots_booked",
    ];
    const updates = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    // Backwards compatible: allow a string address and coerce to {line1,line2}
    if (typeof updates.address === "string") {
      updates.address = { line1: updates.address, line2: "" };
    }

    const doctor = await doctorModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await invalidateDoctorCache(req.params.id);
    res.json(normalizeDoctorAddress(doctor));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMyDoctorProfile = async (req, res) => {
  try {
    if (!req.doctor) return res.status(401).json({ message: "Unauthorized" });

    const allowedFields = [
      "name",
      // email is intentionally excluded from self-update to avoid collisions
      "speciality",
      "degree",
      "experience",
      "about",
      "available",
      "fees",
      "address",
      "availability",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    // Coerce types when coming from multipart/form-data (everything is a string)
    if (typeof updates.fees === "string") {
      const num = Number(updates.fees);
      if (Number.isFinite(num)) updates.fees = num;
    }
    if (typeof updates.available === "string") {
      if (updates.available === "true") updates.available = true;
      if (updates.available === "false") updates.available = false;
    }

    // Parse JSON-encoded fields when sent via multipart
    if (typeof updates.address === "string") {
      try {
        updates.address = JSON.parse(updates.address);
      } catch {
        updates.address = { line1: updates.address, line2: "" };
      }
    }
    if (typeof updates.availability === "string") {
      try {
        updates.availability = JSON.parse(updates.availability);
      } catch {
        // Don't overwrite the array field with an invalid string
        delete updates.availability;
      }
    }

    // Backwards compatible: allow a string address
    if (typeof updates.address === "string") {
      updates.address = { line1: updates.address, line2: "" };
    }

    // Optional images (multipart). Only update if new files provided.
    const profileFile = req.files?.profilePic?.[0];
    const clinicFile = req.files?.clinicPic?.[0];

    const cloudinaryConfigured = Boolean(
      pickEnv(["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_NAME"])
      && pickEnv(["CLOUDINARY_API_KEY"])
      && pickEnv(["CLOUDINARY_API_SECRET", "CLOUDINARY_SECRET_KEY"])
    );

    if ((profileFile || clinicFile) && !cloudinaryConfigured) {
      return res.status(500).json({ message: "Cloudinary is not configured on the server" });
    }

    if (profileFile?.buffer) {
      const result = await uploadBufferToCloudinary(profileFile.buffer, {
        folder: "medconnect/doctors",
        resource_type: "image",
      });
      updates.profilePic = result.secure_url;
    }

    if (clinicFile?.buffer) {
      const result = await uploadBufferToCloudinary(clinicFile.buffer, {
        folder: "medconnect/clinics",
        resource_type: "image",
      });
      updates.clinicPic = result.secure_url;
    }

    const doctor = await doctorModel.findById(req.doctor._id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Apply non-file updates
    for (const [key, value] of Object.entries(updates)) {
      doctor[key] = value;
    }

    // Apply image updates (only when provided)
    if (updates.profilePic) doctor.profilePic = updates.profilePic;
    if (updates.clinicPic) doctor.clinicPic = updates.clinicPic;

    // Ensure defaults are persisted for older records
    if (typeof doctor.profilePic !== "string" || !doctor.profilePic.trim()) {
      doctor.profilePic = DEFAULT_IMAGE_URL;
    }
    if (typeof doctor.clinicPic !== "string" || !doctor.clinicPic.trim()) {
      doctor.clinicPic = DEFAULT_IMAGE_URL;
    }

    // Compute profile completeness and persist
    const normalizedBeforeSave = normalizeDoctorAddress(doctor);
    doctor.isProfileComplete = isDoctorProfileComplete(normalizedBeforeSave);

    await doctor.save();

    const saved = await doctorModel.findById(req.doctor._id).select("-password");
    await invalidateDoctorCache(req.doctor._id.toString());
    res.json(normalizeDoctorAddress(saved));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");
    res.json(doctors.map(normalizeDoctorAddress));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
