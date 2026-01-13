// backend/controllers/gradeController.js

const Student = require("../models/Student");
const Grade = require("../models/Grade");
const mongoose = require("mongoose");

// ===============================
// GET ALL GRADES WITH STUDENT COUNT (Dashboard summary)
// ===============================
exports.getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find().lean();

    const gradeSummary = await Promise.all(
      grades.map(async (g) => {
        const count = await Student.countDocuments({ grade: g._id });

        return {
          gradeId: g._id,
          name: g.name,
          studentCount: count,
        };
      })
    );

    return res.json({
      success: true,
      grades: gradeSummary,
    });

  } catch (err) {
    console.error("Get grades error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load grades",
    });
  }
};



// ====================================================
// GET ALL GRADES WITH THEIR STUDENT LISTS (For AdmGrades.jsx)
// ====================================================
exports.getAllGradesWithStudents = async (req, res) => {
  try {
    const grades = await Grade.find().lean();

    const fullGrades = await Promise.all(
      grades.map(async (g) => {
        const students = await Student.find({ grade: g._id })
          .select("name email createdAt")
          .sort({ name: 1 })
          .lean();

        return {
          _id: g._id,
          name: g.name,
          students: students.map((s) => ({
            studentId: s._id,
            name: s.name,
            email: s.email,
            registeredAt: s.createdAt,
          })),
        };
      })
    );

    return res.json({
      success: true,
      grades: fullGrades,
    });

  } catch (err) {
    console.error("ERROR loading grades with students:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load grades",
    });
  }
};




// ===============================
// GET STUDENTS BY GRADE ID
// ===============================
exports.getStudentsByGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;

    if (!mongoose.isValidObjectId(gradeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid grade ID",
      });
    }

    const grade = await Grade.findById(gradeId).lean();
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    const students = await Student.find({ grade: gradeId })
      .select("-password")
      .sort({ name: 1 });

    return res.json({
      success: true,
      grade: { id: grade._id, name: grade.name },
      students,
    });

  } catch (err) {
    console.error("Get students error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};
