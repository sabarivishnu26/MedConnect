import express from "express";
import { getProfile, updateProfile } from "../controllers/usercontroller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { cacheResponse } from "../middlewares/cacheMiddleware.js";
import { cacheKeys, CACHE_TTL } from "../utils/cacheKeys.js";

const router = express.Router();

// secure routes with authMiddleware (JWT)
router.get(
  "/profile",
  authMiddleware,
  cacheResponse({
    keyGenerator: (req) => cacheKeys.patientProfile(req.user.id),
    ttlSeconds: CACHE_TTL.PATIENT_PROFILE,
  }),
  getProfile
);
router.put("/profile", authMiddleware, updateProfile);

export default router;
