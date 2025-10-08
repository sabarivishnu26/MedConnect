import express from "express";
import { getProfile, updateProfile } from "../controllers/usercontroller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// secure routes with authMiddleware (JWT)
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

export default router;
