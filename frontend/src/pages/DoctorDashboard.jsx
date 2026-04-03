import React, { useState, useEffect } from 'react'
import { api } from "../lib/api";
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

  const renderStatusStamp = (status) => {
    switch (status) {
      case "accepted":
        return (
          <div className="border-2 border-green-500 text-green-500 bg-transparent px-3 py-1 text-xs font-bold tracking-widest uppercase -rotate-12">
            ACCEPTED
          </div>
        )
      case "rejected":
        return (
          <div className="border-2 border-red-500 bg-red-200 text-red-600 px-3 py-1 text-xs font-bold tracking-widest uppercase -rotate-12">
            REJECTED
          </div>
        )
      case "cancelled":
        return (
          <div className="border border-gray-400 text-gray-600 bg-transparent px-3 py-1 text-xs font-bold tracking-widest uppercase -rotate-6">
            CANCELLED
          </div>
        )
      default:
        return null
    }
  }

  // ✅ TOKEN + DOCTOR ID
  const token = localStorage.getItem("token")
  let decoded = null
  if (token) {
    try {
      decoded = jwtDecode(token)
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("role")
      decoded = null
    }
  }
  const doctorId = decoded?.id

  // ✅ FETCH APPOINTMENTS
  const fetchAppointments = async () => {
    if (!doctorId) return

    try {
      setLoading(true)
      const res = await api.get(
        `/api/appointments/doctor/${doctorId}/date/${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  // ✅ ACCEPT
  const handleAccept = async (id) => {
    try {
      await api.patch(
        `/api/appointments/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      fetchAppointments()
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ REJECT
  const handleReject = async (id) => {
    try {
      await api.patch(
        `/api/appointments/${id}/reject`,
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
    appt => appt.status === 'accepted'
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
            <div key={appt._id} className="relative border p-3 mb-2 flex justify-between">

              <div className="absolute top-2 right-2">
                {renderStatusStamp(appt.status)}
              </div>

              <div>
                <p>{appt.time}</p>
                <p>{appt.user?.name}</p>
                <p>{appt.reason}</p>
                <p>{appt.status}</p>
              </div>

              {appt.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(appt._id)}>Accept</button>
                  <button onClick={() => handleReject(appt._id)}>Reject</button>
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