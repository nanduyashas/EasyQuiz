// backend/routes/StdProfileRoutes.js
const express = require("express");
const router = express.Router();

const { auth, studentOnly } = require("../middlewere/authMiddleware");
const upload = require("../middlewere/upload");

// ⭐ Use central controller file
const studentProfileController = require("../controllers/studentProfileController");

console.log("📌 StdProfileRoutes Loaded Successfully");

// ----------------------------------------------------
// GET PROFILE (FULL FIXED VERSION)
// ----------------------------------------------------
router.get(
  "/", 
  auth, 
  studentOnly, 
  studentProfileController.getStudentProfile
);

// ----------------------------------------------------
// UPDATE PROFILE (name + grade)
// ----------------------------------------------------
router.put(
  "/update",
  auth,
  studentOnly,
  studentProfileController.updateStudentProfile
);

// ----------------------------------------------------
// UPDATE PROFILE IMAGE
// ----------------------------------------------------
router.put(
  "/update-image",
  auth,
  studentOnly,
  upload.single("profileImage"),
  studentProfileController.updateProfileImage
);

// ----------------------------------------------------
// REMOVE PROFILE IMAGE
// ----------------------------------------------------
router.delete(
  "/remove-image",
  auth,
  studentOnly,
  studentProfileController.removeProfileImage
);

// ----------------------------------------------------
// CHANGE PASSWORD
// ----------------------------------------------------
router.put(
  "/change-password",
  auth,
  studentOnly,
  studentProfileController.changeStudentPassword
);

// ----------------------------------------------------
// DELETE ACCOUNT
// ----------------------------------------------------
router.delete(
  "/delete-account",
  auth,
  studentOnly,
  studentProfileController.deleteStudentAccount
);

module.exports = router;
