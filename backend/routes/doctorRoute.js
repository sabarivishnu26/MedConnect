/*import express from "express";
import { registerDoctor } from "../controllers/doctorController.js";

import upload from "../middlewares/multer.js";

const doctorrouter = express.Router();

// Route to register a new doctor
doctorrouter.post('/doctor-register', upload.single('image'), registerDoctor);

export default doctorrouter;*/

import express from "express";
import { getDoctorProfile, updateDoctorProfile, getAllDoctors, getMyDoctorProfile, updateMyDoctorProfile } from "../controllers/doctorController.js";
import { authDoctor } from "../middlewares/authDoctor.js";
import { doctorImagesUpload } from "../middlewares/doctorImageUpload.js";
import { cacheResponse } from "../middlewares/cacheMiddleware.js";
import { cacheKeys, CACHE_TTL } from "../utils/cacheKeys.js";

const router = express.Router();

// Authenticated doctor (no hardcoded IDs)
router.get("/me", authDoctor, getMyDoctorProfile);
router.put(
	"/me",
	authDoctor,
	(req, res, next) => {
		doctorImagesUpload(req, res, (err) => {
			if (err) return res.status(400).json({ message: err.message });
			next();
		});
	},
	updateMyDoctorProfile
);

// Fetch doctor list + profile (cached)
router.get(
  "/",
  cacheResponse({
    keyGenerator: () => cacheKeys.doctorsList(),
    ttlSeconds: CACHE_TTL.DOCTORS_LIST,
  }),
  getAllDoctors
);
router.get(
  "/:id",
  cacheResponse({
    keyGenerator: (req) => cacheKeys.doctorProfile(req.params.id),
    ttlSeconds: CACHE_TTL.DOCTOR_PROFILE,
  }),
  getDoctorProfile
);
// Update doctor profile
router.put("/:id", authDoctor, updateDoctorProfile);

export default router;
