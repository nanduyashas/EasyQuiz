// backend/controllers/AdmDashboardController.js

const Grade = require("../models/Grade");
const AdmSubject = require("../models/AdmSubject");
const Student = require("../models/Student");
const AdminQuiz = require("../models/AdminQuiz");

let StudentQuiz;
try {
  StudentQuiz = require("../models/StudentQuiz");
} catch (err) {
  StudentQuiz = null;
}

// =============================
// GET FULL ADMIN DASHBOARD DATA
// =============================
exports.getDashboardData = async (req, res) => {
  try {
    // ---- TOTAL USERS ----
    const totalStudents = await Student.countDocuments();
    const totalAdmins = 1;
    const totalUsers = totalStudents + totalAdmins;

    // ---- TOTAL QUIZZES ----
    const totalQuizzes = await AdminQuiz.countDocuments();

    // ---- ACTIVE STUDENTS ----
    const activeStudents = totalStudents;

    // =============================
    // GRADE SUMMARY (NEW FIX)
    // =============================
    const gradeDocs = await Grade.find();

    const grades = await Promise.all(
      gradeDocs.map(async (g) => {
        const studentCount = await Student.countDocuments({ grade: g._id });

        return {
          gradeId: g._id,
          name: g.name,
          students: studentCount,
        };
      })
    );

    // =============================
    // SUBJECT SUMMARY BY GRADE
    // =============================
    const subjectDocs = await AdmSubject.find().lean();

    const subjectsByGrade = {};

    for (const g of gradeDocs) {
      subjectsByGrade[g._id] = subjectDocs
        .filter((s) => String(s.grade) === String(g._id))
        .map((s) => ({
          subjectId: s._id,
          name: s.name,
          units: s.units || [],
        }));
    }

    // =============================
    // LEADERBOARD
    // =============================
    let leaderboard = [];

    try {
      if (StudentQuiz) {
        const quizResults = await StudentQuiz.find()
          .sort({ score: -1 })
          .limit(5);

        leaderboard = quizResults.map((q) => ({
          name: q.studentName || "Unknown",
          score: q.score || 0,
        }));
      } else {
        leaderboard = [
          { name: "Nimal Perera", score: 98 },
          { name: "Kavindu Silva", score: 95 },
          { name: "Amanda Fernando", score: 92 },
        ];
      }
    } catch (err) {
      console.warn("⚠ Leaderboard error:", err.message);
    }

    return res.json({
      success: true,
      totalUsers,
      totalQuizzes,
      activeStudents,
      grades,
      subjectsByGrade,
      leaderboard,
    });

  } catch (err) {
    console.error("🔥 DASHBOARD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Dashboard data loading failed",
      error: err.message,
    });
  }
};
