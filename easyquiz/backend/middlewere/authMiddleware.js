// backend/middlewere/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Main AUTH middleware
const auth = (req, res, next) => {
  try {
    let token = req.headers["authorization"];

    if (!token)
      return res.status(401).json({ success: false, message: "No token provided" });

    if (token.startsWith("Bearer ")) token = token.slice(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin only" });
  next();
};

const studentOnly = (req, res, next) => {
  if (req.user.role !== "student")
    return res.status(403).json({ success: false, message: "Student only" });
  next();
};

module.exports = { auth, adminOnly, studentOnly };
