import React from 'react';

const DoctorAppointmentCard = ({ appointment, onAccept, onReject }) => (
  <div className="flex items-center gap-4 py-3 border-b">
    <img
      src={appointment.user.profilePic}
      alt={appointment.user.name}
      className="w-16 h-16 rounded-full bg-indigo-50 object-cover"
    />
    <div className="flex-1">
      <p className="font-semibold text-neutral-800">{appointment.user.name}</p>
      <p className="text-xs text-zinc-600">Time: <span className="font-medium">{appointment.time}</span></p>
      <p className="text-xs text-zinc-600">Reason: {appointment.reason}</p>
    </div>
    <div className="flex gap-2">
      <button
        className="bg-green-100 hover:bg-green-500 hover:text-white text-green-700 rounded-full p-2 transition-all"
        title="Accept"
        onClick={() => onAccept(appointment.id)}
      >
        ✓
      </button>
      <button
        className="bg-red-100 hover:bg-red-500 hover:text-white text-red-700 rounded-full p-2 transition-all"
        title="Reject"
        onClick={() => onReject(appointment.id)}
      >
        ✗
      </button>
    </div>
  </div>
);

export default DoctorAppointmentCard;