import Appointment from "../models/appointmentModel.js";

export const bookAppointment = async (req, res) => {
  try {
    const { user, doctor, date, time, reason } = req.body;
    const appointment = await Appointment.create({ user, doctor, date, time, reason });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctor: doctorId }).populate("user");
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({ user: userId }).populate("doctor");
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDoctorAppointmentsByDate = async (req, res) => {
  try {
   // const doctorId = req.doctor._id;    //use atlast
    
    const { doctorId,date } = req.params;
    const appointments = await Appointment.find({ doctor: doctorId, date }).populate("user");
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};