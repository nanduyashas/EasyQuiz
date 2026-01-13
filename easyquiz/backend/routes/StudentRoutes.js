const express = require("express");
const router = express.Router();

const { auth, adminOnly } = require("../middlewere/authMiddleware");
const { getStudentsByGrade } = require("../controllers/studentController");

// GET students of specific grade
router.get("/by-grade/:grade", auth, adminOnly, getStudentsByGrade);

module.exports = router;
