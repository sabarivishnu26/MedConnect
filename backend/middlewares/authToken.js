import jwt from "jsonwebtoken";

// Generic JWT verifier for routes that allow both user & doctor.
// Attaches the decoded payload to req.auth.
const authToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authToken;
