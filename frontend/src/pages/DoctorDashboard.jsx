import React, { useState, useEffect } from 'react';

// Helper to get Indian time
const getIndianTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

// Generate fake appointments for any date
const getFakeAppointments = (date) => [
  {
    id: 1,
    user: { name: 'Sanjay Kumar', profilePic: 'https://randomuser.me/api/portraits/men/32.jpg' },
    date,
    time: '10:00',
    reason: 'General Checkup',
    status: 'pending'
  },
  {
    id: 2,
    user: { name: 'Priya Sharma', profilePic: 'https://randomuser.me/api/portraits/women/44.jpg' },
    date,
    time: '11:30',
    reason: 'Consultation',
    status: 'pending'
  },
];

function DoctorDashboard() {
  // Calendar state
  const today = getIndianTime();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState(getFakeAppointments(selectedDate));

  // Update appointments when date changes
  useEffect(() => {
    setAppointments(getFakeAppointments(selectedDate));
  }, [selectedDate]);

  // Auto-complete appointments whose time has passed
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
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, [selectedDate]);

  // Calendar helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Build calendar grid
  const calendarRows = [];
  let cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null); // empty cells before 1st
  }
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

  // Accept appointment
  const handleAccept = (id) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: 'scheduled' } : appt
      )
    );
  };

  // Cancel appointment
  const handleCancel = (id) => {
    setAppointments((prev) => prev.filter((appt) => appt.id !== id));
  };

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

      {/* Schedule Table */}
      <div>
        <p className="ph-3 font-medium text-zinc-700 border-b mb-4">Schedule for {selectedDate}</p>
        {appointments.length === 0 ? (
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
                    key={appt.id}
                    className={`border-b ${appt.status === 'completed' ? 'border-green-500' : ''}`}
                  >
                    <td className="py-2 px-4 font-medium">{appt.time}</td>
                    <td className="py-2 px-4 flex items-center gap-3">
                      <img
                        src={appt.user.profilePic}
                        alt={appt.user.name}
                        className="w-10 h-10 rounded-full bg-indigo-50 object-cover"
                      />
                      <span className="font-semibold text-neutral-800">{appt.user.name}</span>
                    </td>
                    <td className="py-2 px-4 text-zinc-600">{appt.reason}</td>
                    <td className={`py-2 px-4 font-semibold ${appt.status === 'completed' ? 'text-green-600' : ''}`}>
                      {appt.status === 'completed' ? 'Completed' : appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </td>
                    <td className="py-2 px-4">
                      {appt.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            className="bg-green-100 hover:bg-green-500 hover:text-white text-green-700 rounded-full p-2 transition-all"
                            title="Accept"
                            onClick={() => handleAccept(appt.id)}
                          >
                            ✓
                          </button>
                          <button
                            className="bg-red-100 hover:bg-red-500 hover:text-white text-red-700 rounded-full p-2 transition-all"
                            title="Cancel"
                            onClick={() => handleCancel(appt.id)}
                          >
                            ✗
                          </button>
                        </div>
                      )}
                      {appt.status === 'scheduled' && (
                        <span className="text-blue-500">Scheduled</span>
                      )}
                      {appt.status === 'completed' && (
                        <span className="text-green-600 font-semibold">Completed</span>
                      )}
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