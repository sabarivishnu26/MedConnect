import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const DEFAULT_IMAGE_URL =
  "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_incoming&w=740&q=80";

function renderStatusStamp(status) {
  switch (status) {
    case "accepted":
      return (
        <div className="border-2 border-green-500 text-green-500 bg-transparent px-3 py-1 text-xs font-bold tracking-widest uppercase -rotate-12">
          ACCEPTED
        </div>
      );
    case "rejected":
      return (
        <div className="border-2 border-red-500 bg-red-200 text-red-600 px-3 py-1 text-xs font-bold tracking-widest uppercase -rotate-12">
          REJECTED
        </div>
      );
    case "cancelled":
      return (
        <div className="border border-gray-400 text-gray-600 bg-transparent px-3 py-1 text-xs font-bold tracking-widest uppercase -rotate-6">
          CANCELLED
        </div>
      );
    case "paid":
      return (
        <div className="border-2 border-green-500 text-green-500 bg-transparent px-3 py-1 text-xs font-bold tracking-widest uppercase -rotate-12">
          PAID
        </div>
      );
    default:
      return null;
  }
}

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const navigate = useNavigate();

  // 🔹 Global fetchAppointments function
  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      const userId = decoded.id || decoded._id;

      const res = await api.get(
        `/api/appointments/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handlePayment = async (appointmentId) => {
    console.log("API URL:", import.meta.env.VITE_API_URL);
    const token = localStorage.getItem("token");
    if (!token) return;

    setPaymentLoading(appointmentId);
    try {
      const res = await api.post(
        "/api/payment/create-checkout-session",
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Error initiating payment", err);
      alert("Failed to initiate payment");
      setPaymentLoading(null);
      console.log(err);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    const token = localStorage.getItem("token");
    console.log("Cancelling appointment with ID:", appointmentId);

    try {
      await api.patch(
        `/api/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      console.error("Error cancelling appointment", err);
      alert("Failed to cancel appointment");
    }
  };

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div>
      <p className="ph-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      <div>
        {appointments.length === 0 ? (
          <p className="text-center mt-4 text-gray-500">
            No appointments found.
          </p>
        ) : (
          appointments.map((item, index) => (
            <div
              className="relative grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              <div className="absolute top-2 right-2">
                {renderStatusStamp(item.status)}
              </div>
              <div>
                <img
                  onClick={() => item.doctor?._id && navigate(`/appointment/${item.doctor._id}`)}
                  className="w-32 bg-indigo-50 cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
                  src={(typeof item.doctor?.profilePic === "string" && item.doctor.profilePic.trim()) ? item.doctor.profilePic : DEFAULT_IMAGE_URL}
                  alt=""
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <p className="text-neutral-800 font-semibold">
                    {item.doctor?.name}
                  </p>
                </div>

                <p>{item.doctor?.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{item.doctor?.address?.line1}</p>
                <p className="text-xs">{item.doctor?.address?.line2}</p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date &amp; Time:
                  </span>{" "}
                  {new Date(item.date).toLocaleDateString()} | {item.time}
                </p>
              </div>
              <div></div>
              <div className="flex flex-col gap-2 justify-end">
                {item.status === "pending" && (
                  <>
                    <button
                      onClick={() => handlePayment(item._id)}
                      disabled={paymentLoading === item._id}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentLoading === item._id ? "Processing..." : "Pay Online"}
                    </button>
                    <button
                      onClick={() => handleCancel(item._id)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
                {item.status === "paid" && (
                  <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500 bg-green-50 font-medium cursor-default">
                    Paid
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyAppointments;
