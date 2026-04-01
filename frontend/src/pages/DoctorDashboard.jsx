import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

// ✅ Get Indian Time
const getIndianTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
}

function DoctorDashboard() {

  const today = getIndianTime()

  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10))
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)

  // ✅ TOKEN + DOCTOR ID
  const token = localStorage.getItem("token")
  const decoded = token ? jwtDecode(token) : null
  const doctorId = decoded?.id

  // ✅ FETCH APPOINTMENTS
  const fetchAppointments = async () => {
    if (!doctorId) return

    try {
      setLoading(true)
      const res = await axios.get(
        `http://localhost:5000/api/appointments/doctor/${doctorId}/date/${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setAppointments(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [doctorId, selectedDate])

  // ✅ AUTO COMPLETE (FIXED)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = getIndianTime()

      setAppointments(prev =>
        prev.map(appt => {
          if (
            appt.status === 'accepted' &&
            appt.date === now.toISOString().slice(0, 10) &&
            now >= new Date(`${appt.date}T${appt.time}:00+05:30`)
          ) {
            return { ...appt, status: 'completed' }
          }
          return appt
        })
      )
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // ✅ ACCEPT
  const handleAccept = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/appointments/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      fetchAppointments()
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ CANCEL
  const handleCancel = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/appointments/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      fetchAppointments()
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ FILTER
  const scheduledAppointments = appointments.filter(
    appt => appt.status === 'accepted' || appt.status === 'completed'
  )

  // ✅ CALENDAR LOGIC
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()

  const calendarRows = []
  let cells = []

  for (let i = 0; i < firstDay; i++) cells.push(null)

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
    if (cells.length === 7) {
      calendarRows.push(cells)
      cells = []
    }
  }

  if (cells.length) {
    while (cells.length < 7) cells.push(null)
    calendarRows.push(cells)
  }

  return (
    <div className="max-w-2xl mx-auto mt-12">

      {/* CALENDAR */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <button onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}>{"<"}</button>
          <span>
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}>{">"}</button>
        </div>

        <table className="w-full border text-center">
          <thead>
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {calendarRows.map((row, i) => (
              <tr key={i}>
                {row.map((d, j) => {
                  const dateStr = d
                    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                    : ''

                  return (
                    <td key={j}>
                      {d && (
                        <button
                          onClick={() => setSelectedDate(dateStr)}
                          className={selectedDate === dateStr ? 'bg-primary text-white rounded-full' : ''}
                        >
                          {d}
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* APPOINTMENTS */}
      <div>
        <p className="font-medium border-b mb-4">Appointments for {selectedDate}</p>

        {loading ? (
          <p>Loading...</p>
        ) : appointments.length === 0 ? (
          <p>No appointments</p>
        ) : (
          appointments.map(appt => (
            <div key={appt._id} className="border p-3 mb-2 flex justify-between">

              <div>
                <p>{appt.time}</p>
                <p>{appt.user?.name}</p>
                <p>{appt.reason}</p>
                <p>{appt.status}</p>
              </div>

              {appt.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(appt._id)}>Accept</button>
                  <button onClick={() => handleCancel(appt._id)}>Reject</button>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* SCHEDULE */}
      <div className="mt-10">
        <p className="font-medium border-b mb-4">Today's Schedule</p>

        {scheduledAppointments.map(appt => (
          <div key={appt._id} className="border p-2 mb-2">
            <p>{appt.time} - {appt.user?.name}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default DoctorDashboard