// backend/controllers/studentProfileController.js
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// GET PROFILE
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      user: student,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// UPDATE PROFILE (name + grade)
exports.updateStudentProfile = async (req, res) => {
  try {
    const { name, grade } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (grade !== undefined) updateData.grade = grade;

    const updated = await Student.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated",
      user: updated,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// UPDATE PROFILE IMAGE
exports.updateProfileImage = async (req, res) => {
  try {
    const img = req.file ? `/uploads/${req.file.filename}` : "";

    const updated = await Student.findByIdAndUpdate(
      req.user.id,
      { profileImage: img },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile image updated",
      user: updated, // return full user so frontend can sync
      profileImage: updated.profileImage,
    });
  } catch (err) {
    console.error("Image update error:", err);
    return res.status(500).json({
      success: false,
      message: "Profile image update failed",
    });
  }
};

// REMOVE PROFILE IMAGE
exports.removeProfileImage = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.user.id,
      { profileImage: "" },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile image removed",
      user: updated, // IMPORTANT: return updated user
    });
  } catch (err) {
    console.error("Remove image error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove image",
    });
  }
};

// CHANGE PASSWORD
exports.changeStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check current password
    const matched = await bcrypt.compare(currentPassword, student.password);
    if (!matched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    student.password = hashed;
    await student.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Password change error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
    });
  }
};

// DELETE ACCOUNT
exports.deleteStudentAccount = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      message: "Account deleted permanently",
    });
  } catch (err) {
    console.error("Delete account error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
};