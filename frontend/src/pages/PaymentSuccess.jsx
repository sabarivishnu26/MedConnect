import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const session_id = searchParams.get("session_id");
      const appointment_id = searchParams.get("appointment_id");

      if (!session_id || !appointment_id) {
        setStatus("error");
        setMessage("Invalid payment details. Please contact support.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("error");
        setMessage("You must be logged in to verify payment.");
        return;
      }

      try {
        await api.post(
          "/api/payment/verify",
          { session_id, appointment_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatus("success");
        setMessage("Your appointment has been confirmed!");
        // Redirect after 2.5s so user can read the success message
        setTimeout(() => navigate("/myappointments"), 2500);
      } catch (err) {
        console.error("Payment verification failed", err);
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
          "Payment verification failed. Please contact support."
        );
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div
        className={`text-center p-10 bg-white shadow-md rounded-xl max-w-md w-full border ${status === "error"
          ? "border-red-200"
          : status === "success"
            ? "border-green-200"
            : "border-gray-100"
          }`}
      >
        {/* ── Verifying state ── */}
        {status === "verifying" && (
          <>
            {/* Spinner */}
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-700 mb-2">
              Verifying Payment
            </h2>
            <p className="text-sm text-gray-500">
              Please wait while we confirm your payment with Stripe…
            </p>
          </>
        )}

        {/* ── Success state ── */}
        {status === "success" && (
          <>
            {/* Animated checkmark circle */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Payment Successful!
            </h2>
            <p className="text-neutral-600 mb-1">{message}</p>
            <p className="text-sm text-gray-400 mt-3">
              Redirecting to your appointments…
            </p>

            {/* Manual redirect in case auto-redirect is slow */}
            <button
              onClick={() => navigate("/myappointments")}
              className="mt-5 text-sm text-primary underline hover:opacity-80 transition"
            >
              Go now →
            </button>
          </>
        )}

        {/* ── Error state ── */}
        {status === "error" && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Verification Failed
            </h2>
            <p className="text-neutral-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/myappointments")}
              className="bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90 transition-all font-medium"
            >
              Back to Appointments
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;