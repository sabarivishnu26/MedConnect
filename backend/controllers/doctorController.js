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