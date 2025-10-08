/*import validator from "validator"
import bcrypt from "bcrypt"
const registerDoctor = async (req,res) => {
    try {
        const {name,email,password,speciality,degree,experience,about,fees,address} = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!validator.isEmail(email)) {
            res.json({success: false, message: "Please enter a valid email"});
        }
        if (password.length < 8) {
            res.json({success: false, message: "Password must be at least 6 characters long"});
        }

        const 
                                                                                        
    } catch (error) {
        
    }


export {registerDoctor};*/

import doctorModel from "../models/doctorModel.js";

// Get doctor profile by ID
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile by ID
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await doctorModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
