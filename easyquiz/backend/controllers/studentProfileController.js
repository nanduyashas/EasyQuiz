// backend/controllers/studentProfileController.js
const Student = require("../models/Student");
const Grade = require("../models/Grade");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// ----------------------------------------------------
// GET STUDENT PROFILE  (FULLY FIXED VERSION)
// ----------------------------------------------------
exports.getStudentProfile = async (req, res) => {
  try {
    // Populate grade automatically
    const student = await Student.findById(req.user.id)
      .select("-password")
      .populate("grade", "name _id")   // ⭐ IMPORTANT FIX
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Build uniform grade object for frontend
    const gradeInfo = student.grade
      ? { gradeId: String(student.grade._id), name: student.grade.name }
      : null;

    const profile = {
      _id: student._id,
      name: student.name,
      email: student.email,
      profileImage: student.profileImage || "",
      role: student.role || "student",
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      grade: gradeInfo
    };

    return res.json({ success: true, profile });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile"
    });
  }
};

// ----------------------------------------------------
// UPDATE PROFILE (name + grade)
// ----------------------------------------------------
exports.updateStudentProfile = async (req, res) => {
  try {
    const { name, grade } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (grade) updateData.grade = grade;

    const updated = await Student.findByIdAndUpdate(req.user.id, updateData, {
      new: true
    })
      .select("-password")
      .populate("grade", "name _id")
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const gradeInfo = updated.grade
      ? { gradeId: String(updated.grade._id), name: updated.grade.name }
      : null;

    return res.json({
      success: true,
      message: "Profile updated",
      profile: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        profileImage: updated.profileImage,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        grade: gradeInfo
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

// ----------------------------------------------------
// UPDATE PROFILE IMAGE
// ----------------------------------------------------
exports.updateProfileImage = async (req, res) => {
  try {
    const img = req.file ? `/uploads/${req.file.filename}` : "";

    const updated = await Student.findByIdAndUpdate(
      req.user.id,
      { profileImage: img },
      { new: true }
    ).select("-password");

    if (!updated)
      return res.status(404).json({ success: false, message: "Student not found" });

    return res.json({
      success: true,
      message: "Profile image updated",
      user: updated
    });
  } catch (err) {
    console.error("Image update error:", err);
    return res.status(500).json({
      success: false,
      message: "Profile image update failed"
    });
  }
};

// ----------------------------------------------------
// REMOVE PROFILE IMAGE
// ----------------------------------------------------
exports.removeProfileImage = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.user.id,
      { profileImage: "" },
      { new: true }
    ).select("-password");

    if (!updated)
      return res.status(404).json({ success: false, message: "Student not found" });

    return res.json({
      success: true,
      message: "Profile image removed",
      user: updated
    });
  } catch (err) {
    console.error("Remove image error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove image"
    });
  }
};

// ----------------------------------------------------
// CHANGE PASSWORD
// ----------------------------------------------------
exports.changeStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const student = await Student.findById(req.user.id);
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    const matched = await bcrypt.compare(currentPassword, student.password);
    if (!matched)
      return res.status(400).json({ success: false, message: "Incorrect current password" });

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    return res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error("Password change error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update password"
    });
  }
};

// ----------------------------------------------------
// DELETE STUDENT ACCOUNT
// ----------------------------------------------------
exports.deleteStudentAccount = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.user.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Student not found" });

    return res.json({
      success: true,
      message: "Account deleted permanently"
    });
  } catch (err) {
    console.error("Delete account error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account"
    });
  }
};
