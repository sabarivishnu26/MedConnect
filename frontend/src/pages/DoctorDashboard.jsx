import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper to get Indian time
const getIndianTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

function DoctorDashboard() {
  // Calendar state
  const today = getIndianTime();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

/*  // Get JWT token from localStorage (or context)
  const token = localStorage.getItem("token");

  // Fetch appointments from backend using token
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`/api/appointments/doctor/date/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setAppointments(res.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [token, selectedDate]);  */

  // Replace this block in DoctorDashboard.jsx

  const doctorId = "68dde81c67d0d3e662116b4d"; // e.g., "6526c8e2f1a2b3c4d5e6f7a8"

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/appointments/doctor/${doctorId}/date/${selectedDate}`)
      .then(res => {
        // Defensive: ensure appointments is always an array
        if (Array.isArray(res.data)) {
          setAppointments(res.data);
        } else {
          setAppointments([]);
        }
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [doctorId, selectedDate]);

  // Auto-complete appointments whose time has passed (optional, backend should handle this ideally)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = getIndianTime();
      setAppointments((prev) =>
        prev.map((appt) => {
          if (
            appt.status === 'scheduled' &&
            appt.date === now.toISOString().slice(0, 10) &&
            now >= new Date(`${appt.date}T${appt.time}:00+05:30`)
          ) {
            return { ...appt, status: 'completed' };
          }
          return appt;
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  }, [appointments]);

  // Calendar helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Build calendar grid
  const calendarRows = [];
  let cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
    if (cells.length === 7) {
      calendarRows.push(cells);
      cells = [];
    }
  }
  if (cells.length) {
    while (cells.length < 7) cells.push(null);
    calendarRows.push(cells);
  }

  // Accept appointment (should call backend PATCH/PUT in real app)
  const handleAccept = async (id) => {
    try {
      await axios.patch(`/api/appointments/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === id ? { ...appt, status: 'scheduled' } : appt
        )
      );
    } catch (err) {
      // handle error
    }
  };

  // Cancel appointment (should call backend PATCH/PUT in real app)
  const handleCancel = async (id) => {
    try {
      await axios.patch(`/api/appointments/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === id ? { ...appt, status: 'rejected' } : appt
        )
      );
    } catch (err) {
      // handle error
    }
  };

  // Filter for schedule (accepted/scheduled/completed)
  const scheduledAppointments = Array.isArray(appointments)
  ? appointments.filter(appt => appt.status === 'scheduled' || appt.status === 'completed')
  : [];

  return (
    <div className="max-w-2xl mx-auto mt-12">
      {/* Calendar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="px-2 py-1 rounded hover:bg-indigo-100"
          >
            &lt;
          </button>
          <span className="font-semibold text-lg">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="px-2 py-1 rounded hover:bg-indigo-100"
          >
            &gt;
          </button>
        </div>
        <table className="w-full border text-center">
          <thead>
            <tr className="bg-indigo-50">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <th key={d} className="py-1">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarRows.map((row, i) => (
              <tr key={i}>
                {row.map((d, j) => {
                  const dateStr = d
                    ? `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                    : '';
                  const isSelected = selectedDate === dateStr;
                  return (
                    <td key={j} className="py-1">
                      {d ? (
                        <button
                          className={`w-8 h-8 rounded-full ${isSelected ? 'bg-primary text-white' : 'hover:bg-indigo-100'}`}
                          onClick={() => setSelectedDate(dateStr)}
                        >
                          {d}
                        </button>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* All Appointments Table (with Accept/Cancel) */}
      <div>
        <p className="ph-3 font-medium text-zinc-700 border-b mb-4">Appointments for {selectedDate}</p>
        {loading ? (
          <p className="text-center text-zinc-500 py-8">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">No appointments for this date.</p>
        ) : (
          <table className="w-full border text-left">
            <thead>
              <tr className="bg-indigo-50">
                <th className="py-2 px-4">Time</th>
                <th className="py-2 px-4">Patient</th>
                <th className="py-2 px-4">Reason</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appt) => (
                  <tr
                    key={appt._id}
                    className={`border-b ${
                      appt.status === 'completed' ? 'border-green-500' :
                      appt.status === 'rejected' ? 'border-red-500' : ''
                    }`}
                  >
                    <td className="py-2 px-4 font-medium">{appt.time}</td>
                    <td className="py-2 px-4 flex items-center gap-3">
                      <img
                        src={appt.user?.image || '/src/assets/profile_pic.png'}
                        alt={appt.user?.name}
                        className="w-10 h-10 rounded-full bg-indigo-50 object-cover"
                      />
                      <span className="font-semibold text-neutral-800">{appt.user?.name}</span>
                    </td>
                    <td className="py-2 px-4 text-zinc-600">{appt.reason}</td>
                    <td className={`py-2 px-4 font-semibold ${
                      appt.status === 'completed' ? 'text-green-600' :
                      appt.status === 'rejected' ? 'text-red-600' :
                      appt.status === 'scheduled' ? 'text-blue-600' : ''
                    }`}>
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </td>
                    <td className="py-2 px-4">
                      {appt.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            className="bg-green-100 hover:bg-green-500 hover:text-white text-green-700 rounded-full p-2 transition-all"
                            title="Accept"
                            onClick={() => handleAccept(appt._id)}
                          >
                            ✓
                          </button>
                          <button
                            className="bg-red-100 hover:bg-red-500 hover:text-white text-red-700 rounded-full p-2 transition-all"
                            title="Cancel"
                            onClick={() => handleCancel(appt._id)}
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Schedule Table (only accepted/scheduled/completed) */}
      <div className="mt-12">
        <p className="ph-3 font-medium text-zinc-700 border-b mb-4">Today's Schedule</p>
        {scheduledAppointments.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">No scheduled appointments yet.</p>
        ) : (
          <table className="w-full border text-left">
            <thead>
              <tr className="bg-indigo-50">
                <th className="py-2 px-4">Time</th>
                <th className="py-2 px-4">Patient</th>
                <th className="py-2 px-4">Reason</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {scheduledAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appt) => (
                  <tr
                    key={appt._id}
                    className={`border-b ${appt.status === 'completed' ? 'border-green-500' : ''}`}
                  >
                    <td className="py-2 px-4 font-medium">{appt.time}</td>
                    <td className="py-2 px-4 flex items-center gap-3">
                      <img
                        src={appt.user?.image || '/src/assets/profile_pic.png'}
                        alt={appt.user?.name}
                        className="w-10 h-10 rounded-full bg-indigo-50 object-cover"
                      />
                      <span className="font-semibold text-neutral-800">{appt.user?.name}</span>
                    </td>
                    <td className="py-2 px-4 text-zinc-600">{appt.reason}</td>
                    <td className={`py-2 px-4 font-semibold ${appt.status === 'completed' ? 'text-green-600' : ''}`}>
                      {appt.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;