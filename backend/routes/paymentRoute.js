import express from "express";
import { createCheckoutSession, verifyPayment } from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-checkout-session", (req, res, next) => {
    console.log("🔥 ROUTE HIT");
    next();
}, authMiddleware, createCheckoutSession); router.post("/verify", authMiddleware, verifyPayment);

export default router;
