// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Grade = require("../models/Grade");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, adminKey, grade } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let role = "student";

    // ADMIN REGISTER
    if (adminKey) {
      if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin key",
        });
      }
      role = "admin";
    }

    const model = role === "admin" ? Admin : Student;
    const exists = await model.findOne({ email });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? `/uploads/${req.file.filename}` : "";

    let gradeId = null;

    // ⭐ FIX — Convert grade name → ObjectId
    if (role === "student") {
      const gradeDoc = await Grade.findOne({ name: grade });

      if (!gradeDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid grade selected",
        });
      }

      gradeId = gradeDoc._id;
    }

    // ⭐ SAVE STUDENT WITH ObjectId, NOT STRING
    const newUser = await model.create({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage,
      grade: role === "student" ? gradeId : undefined,
    });

    // ⭐ Add student record inside the grade document
    if (role === "student") {
      const gradeDoc = await Grade.findById(gradeId);
      gradeDoc.students.push({
        studentId: newUser._id,
        name,
        email,
        registeredAt: new Date(),
      });
      await gradeDoc.save();
    }

    return res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Admin.findOne({ email });
    let role = "admin";

    if (!user) {
      user = await Student.findOne({ email });
      role = "student";
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: `${role} login successful`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        grade: user.grade || "",
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
