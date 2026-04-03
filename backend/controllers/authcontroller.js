import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import validator from "validator"


const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to select model by role
const getModelByRole = (role) => {
  if (role === "doctor") return Doctor;
  return User;
};

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const Model = getModelByRole(role);

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const existing = await Model.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    
    if (password.length < 4) {
          return res.status(400).json({ message: "Password must be at least 4 characters long" });
        }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAccount = new Model({ name, email, password: hashedPassword });

    await newAccount.save();
    res.status(201).json({ message: `${role} account created successfully` });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const Model = getModelByRole(role);

    const account = await Model.findOne({ email });
    if (!account) return res.status(404).json({ message: `${role} not found` });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: account._id, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeAccount = account.toObject ? account.toObject() : { ...account };
    delete safeAccount.password;

    res.json({ message: "Login successful", token, account: safeAccount });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
