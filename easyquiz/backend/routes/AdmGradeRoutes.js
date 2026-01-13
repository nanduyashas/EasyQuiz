const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/gradeController");
const { auth, adminOnly } = require("../middlewere/authMiddleware");

// GET all grades
router.get("/", auth, adminOnly, gradeController.getGrades);

// ADD grade
router.post("/add", auth, adminOnly, gradeController.addGrade);

// REMOVE grade  (delete → post)
router.post("/remove", auth, adminOnly, gradeController.removeGrade);

// ADD student to grade
router.post("/add-student", auth, adminOnly, gradeController.addStudent);

// REMOVE student  (delete → post)
router.post("/remove-student", auth, adminOnly, gradeController.removeStudent);

module.exports = router;
