import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center p-10 bg-white border border-red-200 shadow-md rounded-xl max-w-md w-full">
        {/* X icon */}
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
          Payment Cancelled
        </h2>
        <p className="text-neutral-600 mb-6">
          Your payment was not completed. Your appointment is still saved — you
          can try again anytime.
        </p>

        <button
          onClick={() => navigate("/myappointments")}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90 transition-all font-medium"
        >
          Back to Appointments
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;