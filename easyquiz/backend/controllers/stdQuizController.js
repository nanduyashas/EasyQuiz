const AdminQuiz = require("../models/AdminQuiz");
const StudentAttempt = require("../models/StudentAttempt");
const Student = require("../models/Student");
const AdmSubject = require("../models/AdmSubject");
const mongoose = require("mongoose");

/* =========================================================
   Helper: sanitize quiz before sending to student
========================================================= */
const sanitizeQuizForStudent = (quizDoc) => {
  if (!quizDoc) return null;

  const q = quizDoc.toObject ? quizDoc.toObject() : quizDoc;

  const questions = (q.questions || []).map((qq) => {
    const { correct, ...rest } = qq;
    return {
      ...rest,
      id: qq._id?.toString() || qq.id,
    };
  });

  return {
    id: q._id,
    grade: q.grade,
    gradeId: q.gradeId,
    subject: q.subject,
    subjectId: q.subjectId || null,
// keep for frontend compatibility
    unit: q.unit,
    title: q.title,
    description: q.description,
    limit: q.limit,
    totalMarks: q.totalMarks,
    timeMinutes: q.timeMinutes,
    affectsRank: !!q.affectsRank,
    questions,
  };
};

/* =========================================================
   GET SUBJECTS FOR QUIZ PAGE
========================================================= */
exports.getQuizSubjects = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).lean();

    if (!student || !student.grade) {
      return res.json({ success: true, subjects: [] });
    }

    const subjects = await AdmSubject.find({
      grade: student.grade,
    })
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      subjects,
    });
  } catch (err) {
    console.error("GET QUIZ SUBJECTS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load quiz subjects",
    });
  }
};

/* =========================================================
   LIST QUIZZES  ✅ FIXED
========================================================= */
exports.listQuizzes = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { subjectId } = req.query;

    const filter = {};
    if (subjectId) filter.subject = subjectId; // ✅ FIX HERE

    const quizzes = await AdminQuiz.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const attempts = await StudentAttempt.find({
      studentId,
      completed: true,
    })
      .select("quizId score")
      .lean();

    const attemptMap = {};
    attempts.forEach((a) => {
      attemptMap[a.quizId.toString()] = a;
    });

    const sanitized = quizzes.map((q) => {
      const s = sanitizeQuizForStudent(q);
      const att = attemptMap[q._id.toString()];
      return {
        ...s,
        attempted: !!att,
        score: att ? att.score : null,
      };
    });

    return res.json({ success: true, quizzes: sanitized });
  } catch (err) {
    console.error("LIST QUIZZES ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================================================
   GET SINGLE QUIZ
========================================================= */
exports.getQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quiz id" });
    }

    const quiz = await AdminQuiz.findById(id);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    return res.json({
      success: true,
      quiz: sanitizeQuizForStudent(quiz),
    });
  } catch (err) {
    console.error("GET QUIZ ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================================================
   SAVE PROGRESS
========================================================= */
exports.saveProgress = async (req, res) => {
  try {
    const { quizId, answers = [], timeLeftSeconds = 0 } = req.body;
    const studentId = req.user._id;

    const attempt = await StudentAttempt.findOneAndUpdate(
      { studentId, quizId, completed: false },
      {
        studentId,
        quizId,
        answers,
        inProgress: true,
        timeLeftSeconds,
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, attempt });
  } catch (err) {
    console.error("SAVE PROGRESS ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================================================
   SUBMIT ATTEMPT
========================================================= */
exports.submitAttempt = async (req, res) => {
  try {
    const { quizId, answers = [] } = req.body;

    const quiz = await AdminQuiz.findById(quizId).lean();
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const correctAnswers = {};

    quiz.questions.forEach((q) => {
      const userAnswer = answers.find(
        (a) => a.questionId === q._id.toString()
      );

      const selected = userAnswer?.selected || null;
      const correctOption = q.correct;

      // store correct answer for review
      correctAnswers[q._id.toString()] = correctOption;

      if (!selected) {
        skipped++;
      } else if (selected === correctOption) {
        correct++;
      } else {
        wrong++;
      }
    });

    const total = quiz.questions.length;
    const accuracy =
      total === 0 ? 0 : Math.round((correct / total) * 100);

    return res.json({
      success: true,
      result: {
        correct,
        wrong,
        skipped,
        accuracy,
        correctAnswers,
      },
    });
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================================================
   LEADERBOARD
========================================================= */
exports.getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const attempts = await StudentAttempt.find({
      quizId,
      completed: true,
    })
      .populate("studentId", "name")
      .sort({ score: -1 })
      .limit(50)
      .lean();

    const leaderboard = attempts.map((a, i) => ({
      rank: i + 1,
      studentName: a.studentId?.name || "Student",
      score: a.score,
    }));

    return res.json({ success: true, leaderboard });
  } catch (err) {
    console.error("LEADERBOARD ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
