import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Global fetchAppointments function
  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id || decoded._id;

      const res = await axios.get(
        `http://localhost:5000/api/appointments/user/${userId}`,
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

  const handleCompletedClick = (id) => {
    alert("Download prescription for appointment " + id);
    
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    const token = localStorage.getItem("token");
    console.log("Cancelling appointment with ID:", appointmentId);

    try {
      await axios.delete(
        `http://localhost:5000/api/appointments/cancel/${appointmentId}`,
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
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              <div>
                <img
                  onClick={() => navigate(`/appointment/${item._id}`)}
                  className="w-32 bg-indigo-50 cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
                  src={item.doctor?.image || "/default-doctor.png"}
                  alt=""
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <p className="text-neutral-800 font-semibold">
                    {item.doctor?.name}
                  </p>
                  {item.status === "completed" && (
                    <>
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium ">
                        Completed
                      </span>
                      <button
                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition"
                        onClick={() => handleCompletedClick(item._id)}
                        title="View Prescription"
                      >
                        Download Prescription
                      </button>
                    </>
                  )}
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
                {item.status !== "completed" && (
                  <>
                    <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 hover:bg-primary hover:text-white transition-all duration-300">
                      Pay Online
                    </button>
                    <button
                      onClick={() => handleCancel(item._id)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Cancel Appointment
                    </button>
                  </>
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
