/*import express from "express";
import { registerDoctor } from "../controllers/doctorController.js";

import upload from "../middlewares/multer.js";

const doctorrouter = express.Router();

// Route to register a new doctor
doctorrouter.post('/doctor-register', upload.single('image'), registerDoctor);

export default doctorrouter;*/

import express from "express";
import { getDoctorProfile, updateDoctorProfile, getAllDoctors } from "../controllers/doctorController.js";

const router = express.Router();

// Fetch doctor profile
router.get("/:id", getDoctorProfile);
router.get("/", getAllDoctors);
// Update doctor profile
router.put("/:id", updateDoctorProfile);

export default router;
