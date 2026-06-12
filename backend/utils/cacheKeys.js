export const CACHE_PREFIX = "medconnect";

export const CACHE_TTL = {
  DOCTORS_LIST: 600,
  DOCTOR_PROFILE: 600,
  APPOINTMENTS: 300,
  PATIENT_PROFILE: 300,
};

export const cacheKeys = {
  doctorsList: () => `${CACHE_PREFIX}:doctors:list`,
  doctorProfile: (doctorId) => `${CACHE_PREFIX}:doctors:profile:${doctorId}`,
  userAppointments: (userId) => `${CACHE_PREFIX}:appointments:user:${userId}`,
  doctorAppointments: (doctorId) => `${CACHE_PREFIX}:appointments:doctor:${doctorId}`,
  doctorAppointmentsByDate: (doctorId, date) =>
    `${CACHE_PREFIX}:appointments:doctor:${doctorId}:date:${date}`,
  patientProfile: (userId) => `${CACHE_PREFIX}:patients:profile:${userId}`,
};
