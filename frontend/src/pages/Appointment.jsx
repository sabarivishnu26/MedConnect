import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from "../lib/api"
import { AppContext } from '../context/AppContext'
import RelatedDoctors from '../components/RelatedDoctors'
import { assets } from '../assets/assets'

const DEFAULT_IMAGE_URL =
  "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_incoming&w=740&q=80";

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const timeToMinutes = (hhmm) => {
  if (typeof hhmm !== "string") return null
  const m = hhmm.trim().match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

const minutesToHHmm = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const formatDateYYYYMMDDLocal = (dateObj) => {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getAllowedTimesForDate = (doctor, dateObj) => {
  const dayName = DAY_NAMES[dateObj.getDay()]
  const availability = Array.isArray(doctor?.availability) ? doctor.availability : []

  const blocks = availability.filter((slot) =>
    typeof slot?.day === 'string'
    && slot.day.trim().toLowerCase() === dayName.toLowerCase()
  )

  const allowed = new Set()
  for (const block of blocks) {
    const startMin = timeToMinutes(block?.startTime)
    const endMin = timeToMinutes(block?.endTime)
    if (startMin == null || endMin == null) continue
    if (endMin <= startMin) continue

    for (let t = startMin; t + 30 <= endMin; t += 30) {
      allowed.add(minutesToHHmm(t))
    }
  }

  let times = Array.from(allowed).sort()

  // Don't show past slots for today (best-effort, local time).
  const now = new Date()
  const isToday = now.toDateString() === dateObj.toDateString()
  if (isToday) {
    const nowMinRaw = now.getHours() * 60 + now.getMinutes()
    const nowRoundedUp = Math.ceil(nowMinRaw / 30) * 30
    times = times.filter((t) => {
      const m = timeToMinutes(t)
      return m != null && m >= nowRoundedUp
    })
  }

  return times
}

const Appointment = () => {

  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol } = useContext(AppContext)

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState("")

  // ✅ FIX: Wait until doctors loaded
  useEffect(() => {
    if (doctors.length > 0) {
      const doctor = doctors.find(doc => doc._id === docId)
      setDocInfo(doctor)
    }
  }, [doctors, docId])

  // ✅ SLOTS (availability-driven)
  useEffect(() => {
    if (!docInfo) return

    const today = new Date()
    const allDays = []

    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(today)
      dateObj.setHours(0, 0, 0, 0)
      dateObj.setDate(today.getDate() + i)

      const dateStr = formatDateYYYYMMDDLocal(dateObj)
      const allowedTimes = getAllowedTimesForDate(docInfo, dateObj)

      const bookedForDate = docInfo?.slots_booked?.[dateStr]
      const bookedSet = new Set(Array.isArray(bookedForDate) ? bookedForDate : [])

      const slots = allowedTimes.map((t) => ({
        time: t,
        isBooked: bookedSet.has(t),
      }))

      allDays.push({
        dateObj,
        dateStr,
        dayName: DAY_NAMES[dateObj.getDay()],
        slots,
      })
    }

    setDocSlots(allDays)
    setSlotTime("")

    const firstWithSlots = allDays.findIndex((d) => d.slots.length > 0)
    setSlotIndex(firstWithSlots >= 0 ? firstWithSlots : 0)
  }, [docInfo])

  // ✅ BOOK
  const handleBookAppointment = async () => {

    const token = localStorage.getItem("token")

    if (!token) {
      alert("Login first")
      return navigate("/login")
    }

    if (!slotTime) {
      alert("Select slot")
      return
    }

    try {
      const selected = docSlots[slotIndex]
      const date = selected?.dateStr
      if (!date) {
        alert("Select a valid day")
        return
      }

      await api.post(
        "/api/appointments/book",
        {
          doctorId: docInfo._id,
          date,
          time: slotTime,
          reason: "General consultation"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("Booked successfully")
      navigate("/myappointments")

    } catch (err) {
      console.log(err.response?.data)
      alert("Booking failed")
    }
  }

  // ✅ LOADING STATE (IMPORTANT)
  if (!docInfo) return <p>Loading doctor...</p>

  return (
    <div>

      {/* DOCTOR INFO */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <img className='bg-primary w-full sm:max-w-72 rounded-lg'
          src={(typeof docInfo.profilePic === "string" && docInfo.profilePic.trim()) ? docInfo.profilePic : DEFAULT_IMAGE_URL} alt="" />

        <div className='flex-1 border rounded-lg p-8 bg-white'>
          <p className='text-2xl font-medium'>
            {docInfo.name}
            <img src={assets.verified_icon} alt="" />
          </p>

          <p>{docInfo.degree} - {docInfo.speciality}</p>
          <p className='mt-2'>{docInfo.about}</p>

          <p className='mt-2'>
            Fee: {currencySymbol}{docInfo.fees}
          </p>
        </div>
      </div>

      {/* SLOTS */}
      <div className='mt-6'>
        <p>Booking slots</p>

        <div className='flex gap-3 mt-4 overflow-x-scroll'>
          {docSlots.map((item, index) => (
            <div key={index}
              onClick={() => {
                if (item.slots.length === 0) return
                setSlotIndex(index)
                setSlotTime("")
              }}
              className={`p-3 rounded ${item.slots.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'cursor-pointer'} ${slotIndex === index ? 'bg-primary text-white' : 'border'}`}>
              <p>{item.dayName.slice(0, 3).toUpperCase()}</p>
              <p>{item.dateObj.getDate()}</p>
            </div>
          ))}
        </div>

        <div className='flex gap-3 mt-4 overflow-x-scroll'>
          {docSlots[slotIndex]?.slots?.length === 0 ? (
            <p className='text-sm text-gray-500'>No slots available for this day.</p>
          ) : (
            docSlots[slotIndex]?.slots?.map((item, index) => (
              <p
                key={index}
                onClick={() => {
                  if (item.isBooked) return
                  setSlotTime(item.time)
                }}
                className={`px-4 py-2 rounded ${item.isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'cursor-pointer border'} ${item.time === slotTime ? 'bg-primary text-white' : ''}`}
              >
                {item.time}
              </p>
            ))
          )}
        </div>

        <button
          onClick={handleBookAppointment}
          disabled={!slotTime}
          className='bg-primary text-white px-10 py-3 rounded-full mt-6'>
          Book Appointment
        </button>
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

    </div>
  )
}

export default Appointment