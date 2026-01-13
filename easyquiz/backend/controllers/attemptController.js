// controllers/attemptController.js
const StudentAttempt = require("../models/StudentAttempt");
const Quiz = require("../models/Quiz");
const Subject = require("../models/Subject");
const { calculateRankAndMaybePromote } = require("../services/rankingService");

/**
 * Start attempt:
 * - Create StudentAttempt document in DB with initial structure
 * - Client should store attemptId and use it for autosave/submit
 */
exports.startAttempt = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { quizId } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // Build answers array from questions
    const answers = quiz.questions.map((q) => ({
      questionId: q._id,
      selected: null,
      correct: q.correct
    }));

    const subj = await Subject.findById(quiz.subjectId);

    const attempt = new StudentAttempt({
      studentId,
      quizId: quiz._id,
      title: quiz.title,
      grade: quiz.grade,
      subject: quiz.subject,
      subjectId: quiz.subjectId,
      ranked: !!quiz.ranked,
      answers,
      totalQuestions: answers.length,
      inProgress: true,
      startedAt: Date.now(),
      completed: false
    });

    await attempt.save();
    return res.json({ success: true, message: "Attempt started", attempt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Save progress (partial):
 * - update attempt.answers, current index, remainingSeconds if provided
 */
exports.saveProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { attemptId } = req.params;
    const payload = req.body; // { answers: [{questionId, selected}], remainingSeconds, currentIndex }

    const attempt = await StudentAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });
    if (String(attempt.studentId) !== String(studentId)) return res.status(403).json({ success: false, message: "Forbidden" });
    if (attempt.completed) return res.status(400).json({ success: false, message: "Attempt already submitted" });

    // Merge answers
    if (Array.isArray(payload.answers)) {
      const map = new Map(payload.answers.map(a => [String(a.questionId), a.selected]));
      attempt.answers = attempt.answers.map(a => {
        const sel = map.get(String(a.questionId));
        if (typeof sel !== "undefined") a.selected = sel;
        return a;
      });
    }

    // Optionally store remainingSeconds (useful for resume, store in metadata or a field)
    if (typeof payload.remainingSeconds !== "undefined") {
      attempt.timeLeftSeconds = Number(payload.remainingSeconds);
    }

    await attempt.save();
    return res.json({ success: true, message: "Progress saved", attempt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Final submit:
 * - Evaluate attempt, compute correctCount, score
 * - Mark completed = true, inProgress = false
 * - If ranked quiz -> call ranking service to recalc rank & maybe promote
 */
exports.submitAttempt = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { attemptId } = req.params;
    const { autoSubmitted } = req.body;

    const attempt = await StudentAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });
    if (String(attempt.studentId) !== String(studentId)) return res.status(403).json({ success: false, message: "Forbidden" });
    if (attempt.completed) return res.status(400).json({ success: false, message: "Attempt already submitted" });

    // If answers were sent in body, merge them
    if (Array.isArray(req.body.answers)) {
      const map = new Map(req.body.answers.map(a => [String(a.questionId), a.selected]));
      attempt.answers = attempt.answers.map(a => {
        const sel = map.get(String(a.questionId));
        if (typeof sel !== "undefined") a.selected = sel;
        return a;
      });
    }

    // Evaluate
    const total = attempt.totalQuestions || attempt.answers.length;
    let correct = 0;
    attempt.answers.forEach((a) => {
      if (a.selected && a.selected === a.correct) correct++;
    });

    // Score as percent
    const score = total === 0 ? 0 : Math.round((correct / total) * 100);

    // mark attempt
    attempt.correctCount = correct;
    attempt.score = score;
    attempt.completed = true;
    attempt.inProgress = false;
    attempt.autoSubmitted = !!autoSubmitted;
    attempt.submittedAt = new Date();
    // Optionally set timeTakenSeconds if client sends it
    if (typeof req.body.timeTakenSeconds !== "undefined") {
      attempt.timeTakenSeconds = Number(req.body.timeTakenSeconds);
    }
    await attempt.save();

    // Recalculate rank if this was a ranked quiz
    let rankResult = null;
    if (attempt.ranked) {
      try {
        rankResult = await calculateRankAndMaybePromote(studentId);
      } catch (err) {
        console.error("Ranking error:", err);
      }
    }

    return res.json({ success: true, message: "Attempt submitted", attempt, rankResult });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * History list for student
 */
exports.getHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const attempts = await StudentAttempt.find({ studentId }).sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, attempts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
