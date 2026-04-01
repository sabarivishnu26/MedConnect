import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from "axios"
import { AppContext } from '../context/AppContext'
import RelatedDoctors from '../components/RelatedDoctors'
import { assets } from '../assets/assets'

const Appointment = () => {

  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol } = useContext(AppContext)

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

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

  // ✅ SLOTS
  useEffect(() => {
    if (!docInfo) return

    let today = new Date()
    let allSlots = []

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while (currentDate < endTime) {
        timeSlots.push({
          datetime: new Date(currentDate),
          time: currentDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        })
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      allSlots.push(timeSlots)
    }

    setDocSlots(allSlots)

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
      const selectedDay = docSlots[slotIndex][0].datetime
      const date = selectedDay.toISOString().slice(0, 10)

      await axios.post(
        "http://localhost:4000/api/appointments/book",
        {
          doctor: docInfo._id,
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
          src={docInfo.image || "/default-doctor.png"} alt="" />

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
              onClick={() => setSlotIndex(index)}
              className={`p-3 rounded cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border'}`}>
              <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        <div className='flex gap-3 mt-4 overflow-x-scroll'>
          {docSlots[slotIndex]?.map((item, index) => (
            <p key={index}
              onClick={() => setSlotTime(item.time)}
              className={`px-4 py-2 rounded cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'border'}`}>
              {item.time}
            </p>
          ))}
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