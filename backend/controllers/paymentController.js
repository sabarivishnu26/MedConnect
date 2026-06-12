import Stripe from "stripe";
import Appointment from "../models/appointmentModel.js";
import dotenv from "dotenv";
import { invalidateAppointmentCaches } from "../utils/cacheInvalidation.js";

// ✅ Lazy-initialize Stripe INSIDE the function, not at module level.
// This prevents silent startup crashes when env vars load after imports.
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_placeholder") {
    throw new Error(
      `STRIPE_SECRET_KEY is missing or still set to placeholder. Check your .env file.`
    );
  }
  return new Stripe(key);
};

// ─────────────────────────────────────────────
// POST /api/payment/create-checkout-session
// ─────────────────────────────────────────────
export const createCheckoutSession = async (req, res) => {
  console.log("🔥 PAYMENT API HIT");
  console.log("✅ createCheckoutSession hit");

  try {
    const stripe = getStripe();

    const { appointmentId } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    const appointment = await Appointment.findById(appointmentId).populate("doctor");
    console.log("   appointment found:", !!appointment);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.user.toString() !== userId.toString()) {
      console.log("   user mismatch:", appointment.user.toString(), "vs", userId.toString());
      return res.status(403).json({ message: "Forbidden: This is not your appointment" });
    }

    if (appointment.status === "paid") {
      return res.status(400).json({ message: "Appointment is already paid" });
    }

    if (appointment.status === "cancelled" || appointment.status === "rejected") {
      return res.status(400).json({ message: "Cannot pay for a cancelled or rejected appointment" });
    }

    const feeAmount =
      appointment.doctor?.fees && appointment.doctor.fees > 0
        ? appointment.doctor.fees
        : 500;

    const origin =
      process.env.FRONTEND_URL ||
      req.headers.origin ||
      "http://localhost:5173";

    const doctorName = appointment.doctor?.name || "Doctor";
    const appointmentDate = appointment.date
      ? new Date(appointment.date).toLocaleDateString("en-IN")
      : "Scheduled date";

    console.log("   Creating Stripe session for fee:", feeAmount, "origin:", origin);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Appointment with Dr. ${doctorName}`,
              description: `${appointmentDate} at ${appointment.time || ""}`,
            },
            unit_amount: Math.round(feeAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointmentId}`,
      cancel_url: `${origin}/payment-cancel`,
      metadata: {
        appointmentId: appointmentId.toString(),
        userId: userId.toString(),
      },
    });

    console.log("   ✅ Stripe session created:", session.id);
    return res.status(200).json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error("❌ createCheckoutSession ERROR:", error.message);
    console.error(error.stack);
    return res.status(500).json({
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/payment/verify
// ─────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  console.log("✅ verifyPayment hit");
  console.log("   body:", req.body);

  try {
    const stripe = getStripe();

    const { session_id, appointment_id } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!session_id || !appointment_id) {
      return res.status(400).json({ message: "Missing session_id or appointment_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("   Stripe payment_status:", session.payment_status);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed by Stripe" });
    }

    const appointment = await Appointment.findById(appointment_id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: This is not your appointment" });
    }

    if (appointment.status === "paid") {
      return res.status(200).json({ message: "Already verified", appointment });
    }

    appointment.status = "paid";
    await appointment.save();

    await invalidateAppointmentCaches({
      userId: appointment.user,
      doctorId: appointment.doctor,
      date: appointment.date,
    });

    console.log("   ✅ Appointment marked as paid:", appointment._id);
    return res.status(200).json({ message: "Payment verified successfully", appointment });

  } catch (error) {
    console.error("❌ verifyPayment ERROR:", error.message);
    console.error(error.stack);
    return res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};