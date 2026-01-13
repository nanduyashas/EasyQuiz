const express = require("express");
const router = express.Router();

const stdQuizController = require("../controllers/stdQuizController");
const { auth, studentOnly } = require("../middlewere/authMiddleware");

/* ================= SUBJECTS FOR QUIZ PAGE ================= */
router.get(
  "/subjects",
  auth,
  studentOnly,
  stdQuizController.getQuizSubjects
);

/* ================= LIST QUIZZES ================= */
router.get(
  "/",
  auth,
  studentOnly,
  stdQuizController.listQuizzes
);

/* ================= SAVE PROGRESS ================= */
router.post(
  "/progress",
  auth,
  studentOnly,
  stdQuizController.saveProgress
);

/* ================= SUBMIT QUIZ ================= */
router.post(
  "/submit",
  auth,
  studentOnly,
  stdQuizController.submitAttempt
);

/* ================= LEADERBOARD ================= */
router.get(
  "/leaderboard/:quizId",
  auth,
  studentOnly,
  stdQuizController.getLeaderboard
);

/* ================= SINGLE QUIZ (LAST) ================= */
router.get(
  "/:id",
  auth,
  studentOnly,
  stdQuizController.getQuiz
);

module.exports = router;
