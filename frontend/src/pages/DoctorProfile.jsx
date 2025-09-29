import React, { useState } from 'react';

const initialDoctor = {
  name: 'Dr. Ramesh Kumar',
  email: 'ramesh.kumar@example.com',
  password: '********',
  specialization: 'Cardiology',
  experience: 10,
  fees: 500,
  phone: '9876543210',
  location: 'Chennai',
  rating: 4.5,
  profilePic: 'https://randomuser.me/api/portraits/men/45.jpg',
  clinicPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  availability: [
    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', startTime: '10:00', endTime: '16:00' },
  ],
};

function DoctorProfile() {
  const [doctor, setDoctor] = useState(initialDoctor);
  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleAvailabilityChange = (idx, field, value) => {
    const updated = doctor.availability.map((slot, i) =>
      i === idx ? { ...slot, [field]: value } : slot
    );
    setDoctor({ ...doctor, availability: updated });
  };

  const handleAddAvailability = () => {
    setDoctor({
      ...doctor,
      availability: [...doctor.availability, { day: '', startTime: '', endTime: '' }],
    });
  };

  const handleRemoveAvailability = (idx) => {
    setDoctor({
      ...doctor,
      availability: doctor.availability.filter((_, i) => i !== idx),
    });
  };

  const handleSave = () => {
    setEditing(false);
    // Save to backend when available
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow">
      {/* Banner and Profile Photo */}
      <div className="relative">
        <img
          src={doctor.clinicPhoto}
          alt="Clinic"
          className="w-full h-48 object-cover rounded-t"
        />
        <div className="absolute left-6 -bottom-12 flex flex-col items-start">
          <div className="relative">
            <img
              src={doctor.profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
            />
            {editing && (
              <input
                type="text"
                name="profilePic"
                value={doctor.profilePic}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-32 mt-2"
                placeholder="Profile Pic URL"
              />
            )}
          </div>
        </div>
        {editing && (
          <div className="absolute top-4 left-6 bg-white bg-opacity-80 p-2 rounded shadow">
            <input
              type="text"
              name="clinicPhoto"
              value={doctor.clinicPhoto}
              onChange={handleChange}
              className="border px-2 py-1 rounded w-64"
              placeholder="Clinic Photo URL"
            />
          </div>
        )}
      </div>
      {/* Profile Info Card */}
      <div className="pt-16 pl-6 pr-6 pb-6">
        <h2 className="text-2xl font-semibold mb-2">{doctor.name}</h2>
        <form className="space-y-4 text-left">
          <div>
            <label className="block text-gray-700">Email:</label>
            {editing ? (
              <input type="email" name="email" value={doctor.email} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
            ) : (
              <p>{doctor.email}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Specialization:</label>
            {editing ? (
              <input type="text" name="specialization" value={doctor.specialization} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
            ) : (
              <p>{doctor.specialization}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Experience (years):</label>
            {editing ? (
              <input type="number" name="experience" value={doctor.experience} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
            ) : (
              <p>{doctor.experience}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Fees (₹):</label>
            {editing ? (
              <input type="number" name="fees" value={doctor.fees} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
            ) : (
              <p>{doctor.fees}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Phone:</label>
            {editing ? (
              <input type="text" name="phone" value={doctor.phone} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
            ) : (
              <p>{doctor.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Location:</label>
            {editing ? (
              <input type="text" name="location" value={doctor.location} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
            ) : (
              <p>{doctor.location}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Rating:</label>
            <p>{doctor.rating}</p>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Availability:</label>
            {editing ? (
              <div className="space-y-2">
                {doctor.availability.map((slot, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Day"
                      value={slot.day}
                      onChange={e => handleAvailabilityChange(idx, 'day', e.target.value)}
                      className="border px-2 py-1 rounded w-1/3"
                    />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={e => handleAvailabilityChange(idx, 'startTime', e.target.value)}
                      className="border px-2 py-1 rounded w-1/4"
                    />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={e => handleAvailabilityChange(idx, 'endTime', e.target.value)}
                      className="border px-2 py-1 rounded w-1/4"
                    />
                    <button type="button" onClick={() => handleRemoveAvailability(idx)} className="text-red-500 px-2">✗</button>
                  </div>
                ))}
                <button type="button" onClick={handleAddAvailability} className="bg-indigo-100 px-3 py-1 rounded mt-2">Add Slot</button>
              </div>
            ) : (
              <ul className="list-disc ml-6">
                {doctor.availability.map((slot, idx) => (
                  <li key={idx}>{slot.day}: {slot.startTime} - {slot.endTime}</li>
                ))}
              </ul>
            )}
          </div>
        </form>
        <div className="mt-6 flex justify-start">
          {editing ? (
            <button type="button" className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
          ) : (
            <button type="button" className="bg-primary text-white px-4 py-2 rounded" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;