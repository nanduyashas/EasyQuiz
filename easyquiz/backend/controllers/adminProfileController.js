// backend/controllers/adminProfileController.js
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

// --------------------------------------------
// GET ADMIN PROFILE
// --------------------------------------------
exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user && req.user.id;
    if (!adminId)
      return res
        .status(401)
        .json({ success: false, message: "Missing admin id" });

    const admin = await Admin.findById(adminId)
      .select("-password")
      .lean();

    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    return res.json({
      success: true,
      message: "Admin profile fetched",
      user: admin,
    });
  } catch (err) {
    console.error("getAdminProfile error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------
// UPDATE PROFILE (name + image)
// --------------------------------------------
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const img = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData = {};
    if (name) updateData.name = name;
    if (img !== undefined) updateData.profileImage = img;

    const updated = await Admin.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res
      .status(500)
      .json({ success: false, message: "Profile update failed" });
  }
};

// --------------------------------------------
// UPDATE PROFILE IMAGE ONLY
// --------------------------------------------
exports.updateProfileImage = async (req, res) => {
  try {
    const img = req.file ? `/uploads/${req.file.filename}` : "";

    const updated = await Admin.findByIdAndUpdate(
      req.user.id,
      { profileImage: img },
      { new: true }
    ).select("-password");

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res.json({
      success: true,
      message: "Profile image updated",
      profileImage: updated.profileImage,
    });
  } catch (err) {
    console.error("Image update error:", err);
    res
      .status(500)
      .json({ success: false, message: "Image update failed" });
  }
};

// --------------------------------------------
// REMOVE PROFILE IMAGE
// --------------------------------------------
exports.removeProfileImage = async (req, res) => {
  try {
    const updated = await Admin.findByIdAndUpdate(
      req.user.id,
      { profileImage: "" },
      { new: true }
    ).select("-password");

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res.json({ success: true, message: "Profile image removed" });
  } catch (err) {
    console.error("Remove image error:", err);
    res
      .status(500)
      .json({ success: false, message: "Image remove failed" });
  }
};

// --------------------------------------------
// CHANGE PASSWORD (admin key required)
// --------------------------------------------
exports.changeAdminPassword = async (req, res) => {
  try {
    const { adminKey, currentPassword, newPassword } = req.body;

    // 1. Check admin key
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid Admin Security Key",
      });
    }

    // 2. Find admin
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // 3. Match current password
    const matched = await bcrypt.compare(currentPassword, admin.password);
    if (!matched) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect current password" });
    }

    // 4. Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;

    await admin.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({
      success: false,
      message: "Server error updating password",
    });
  }
};

// --------------------------------------------
// DELETE ACCOUNT
// --------------------------------------------
exports.deleteAdminAccount = async (req, res) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.user.id);

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res.json({
      success: true,
      message: "Account deleted permanently",
    });
  } catch (err) {
    console.error("Delete error:", err);
    res
      .status(500)
      .json({ success: false, message: "Account delete failed" });
  }
};
