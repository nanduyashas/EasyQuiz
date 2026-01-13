// backend/controllers/admQuizController.js
const AdminQuiz = require("../models/AdminQuiz");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// helper: build public image path
const toPublicPath = (filename) => {
  if (!filename) return null;
  // our upload middleware stores full path; store only the filename in DB for safety
  // We'll save '/uploads/filename' when writing to DB
  return `/uploads/${path.basename(filename)}`;
};

// normalize a quiz doc for response (expose images as-is, compute marksPerQuestion)
const normalizeQuiz = (qDoc) => {
  const q = typeof qDoc.toObject === "function" ? qDoc.toObject() : { ...qDoc };
  const perQ = q.limit && q.limit > 0 ? Number((q.totalMarks / q.limit).toFixed(2)) : 0;
  const questions = (q.questions || []).map((qq) => ({
    ...qq,
    image: qq.image ? qq.image : null,
    marks: qq.marks != null ? qq.marks : null,
  }));
  return { ...q, questions, marksPerQuestion: perQ };
};

// GET /api/adm/quiz
exports.getQuizzes = async (req, res) => {
  try {
    const { grade, subject, unit } = req.query;

    const filter = {};
    if (grade) filter.grade = grade;
    if (subject) filter.subject = subject;
    if (unit && unit !== "All Units") filter.unit = unit;

    const quizzes = await AdminQuiz.find(filter).sort({ createdAt: -1 }).lean();

    // compute marksPerQuestion for each quiz (use limit to split totalMarks equally)
    const normalized = quizzes.map((q) => {
      const perQ = q.limit && q.limit > 0 ? Number((q.totalMarks / q.limit).toFixed(2)) : 0;
      const questions = (q.questions || []).map((qq) => ({
        ...qq,
        image: qq.image ? qq.image : null,
        marks: qq.marks != null ? qq.marks : null,
      }));
      // ensure affectsRank exists (fallback false)
      const affectsRank = typeof q.affectsRank !== "undefined" ? !!q.affectsRank : false;
      return { ...q, questions, marksPerQuestion: perQ, affectsRank };
    });

    return res.json({ success: true, quizzes: normalized });
  } catch (err) {
    console.error("GET QUIZZES ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch quizzes" });
  }
};

// GET /api/adm/quiz/:id
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid quiz id" });
    }

    const quiz = await AdminQuiz.findById(id).lean();
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    const marksPerQuestion = quiz.limit && quiz.limit > 0 ? Number((quiz.totalMarks / quiz.limit).toFixed(2)) : 0;
    const questions = (quiz.questions || []).map((qq) => ({
      ...qq,
      image: qq.image ? qq.image : null,
    }));

    const affectsRank = typeof quiz.affectsRank !== "undefined" ? !!quiz.affectsRank : false;

    return res.json({ success: true, quiz: { ...quiz, questions, marksPerQuestion, affectsRank } });
  } catch (err) {
    console.error("GET QUIZ BY ID ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch quiz" });
  }
};

// POST /api/adm/quiz
// body: { grade, gradeId(optional), subject, subjectId(optional), unit, title, description, limit, totalMarks, timeMinutes, affectsRank }
exports.createQuiz = async (req, res) => {
  try {
    const {
      grade,
      gradeId,
      subject,
      subjectId,
      unit = "All Units",
      title,
      description = "",
      limit = 1,
      totalMarks = 100,
      timeMinutes,
      affectsRank,
    } = req.body;

    if (!grade || !subject) {
  return res.status(400).json({ success: false, message: "grade and subject are required" });
}

    // affectsRank must be provided (explicit selection)
    if (typeof affectsRank === "undefined" || affectsRank === null || affectsRank === "") {
      return res.status(400).json({ success: false, message: "Please select quiz type (Ranking or Practice)" });
    }

    // Accept 'true'/'false' strings or booleans or numbers
    const normalizedAffectsRank = (val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") {
        const s = val.trim().toLowerCase();
        if (s === "true") return true;
        if (s === "false") return false;
      }
      if (typeof val === "number") return !!val;
      return false;
    };
    const affRank = normalizedAffectsRank(affectsRank);

    const numLimit = Number(limit);
    const numTotalMarks = Number(totalMarks);
    const numTime = Number(timeMinutes);

    if (!numLimit || numLimit < 1) {
      return res.status(400).json({ success: false, message: "limit must be >= 1" });
    }
    if (!numTotalMarks || numTotalMarks < 1) {
      return res.status(400).json({ success: false, message: "totalMarks must be >= 1" });
    }
    if (!numTime || numTime < 1) {
      return res.status(400).json({ success: false, message: "timeMinutes is required and must be >= 1" });
    }

    if (gradeId && !mongoose.isValidObjectId(gradeId)) {
      return res.status(400).json({ success: false, message: "Invalid gradeId" });
    }
    if (subjectId && !mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ success: false, message: "Invalid subjectId" });
    }

    // check duplicate (same grade + subject + unit)
    const exists = await AdminQuiz.findOne({ grade, subject, unit });
    if (exists) {
      return res.status(400).json({ success: false, message: "Quiz already exists for this Grade/Subject/Unit" });
    }

    const newQuiz = await AdminQuiz.create({
      grade,
      gradeId: gradeId || null,
      subject,
      subjectId: subjectId || null,
      unit: unit || "All Units",
      title,
      description,
      limit: numLimit,
      totalMarks: numTotalMarks,
      timeMinutes: numTime,
      affectsRank: affRank,
      createdBy: req.user?.id || null,
    });

    // normalize before returning
    const normalized = normalizeQuiz(newQuiz);
    normalized.affectsRank = !!newQuiz.affectsRank;

    return res.json({ success: true, quiz: normalized, message: "Quiz created" });
  } catch (err) {
    console.error("CREATE QUIZ ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to create quiz" });
  }
};

// PUT /api/adm/quiz/:id   (update quiz meta)
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, limit, unit, totalMarks, timeMinutes, affectsRank } = req.body;

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    const quiz = await AdminQuiz.findById(id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    if (title) quiz.title = title;
    if (typeof description !== "undefined") quiz.description = description;
    if (limit) {
      const num = Number(limit);
      if (!num || num < 1) return res.status(400).json({ success: false, message: "limit must be >= 1" });
      quiz.limit = num;

      if (quiz.questions.length > num) {
        quiz.questions = quiz.questions.slice(0, num);
      }
    }
    if (unit) quiz.unit = unit;
    if (typeof totalMarks !== "undefined") {
      const tm = Number(totalMarks);
      if (!tm || tm < 1) return res.status(400).json({ success: false, message: "totalMarks must be >= 1" });
      quiz.totalMarks = tm;
    }
    if (typeof timeMinutes !== "undefined") {
      const t = Number(timeMinutes);
      if (!t || t < 1) return res.status(400).json({ success: false, message: "timeMinutes must be >= 1" });
      quiz.timeMinutes = t;
    }

    if (typeof affectsRank !== "undefined" && affectsRank !== null && affectsRank !== "") {
      // normalize
      const normalizedAffectsRank = (val) => {
        if (typeof val === "boolean") return val;
        if (typeof val === "string") {
          const s = val.trim().toLowerCase();
          if (s === "true") return true;
          if (s === "false") return false;
        }
        if (typeof val === "number") return !!val;
        return false;
      };
      quiz.affectsRank = normalizedAffectsRank(affectsRank);
    }

    await quiz.save();

    const normalized = normalizeQuiz(quiz);
    normalized.affectsRank = !!quiz.affectsRank;

    return res.json({ success: true, quiz: normalized, message: "Quiz updated" });
  } catch (err) {
    console.error("UPDATE QUIZ ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to update quiz" });
  }
};

// DELETE /api/adm/quiz/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    const removed = await AdminQuiz.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ success: false, message: "Quiz not found" });

    // delete question images from disk (best effort)
    try {
      (removed.questions || []).forEach((qq) => {
        if (qq.image) {
          const filepath = path.join(__dirname, "..", qq.image.replace(/^\/+/, "")); // remove leading slash
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
      });
    } catch (e) {
      console.warn("Failed to remove question images:", e);
    }

    return res.json({ success: true, message: "Quiz deleted" });
  } catch (err) {
    console.error("DELETE QUIZ ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to delete quiz" });
  }
};

// POST /api/adm/quiz/:id/questions
// Accepts multipart/form-data with optional image file under 'image'
exports.addQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, a, b, c, d, correct } = req.body;
    // file available as req.file if uploaded

    if (!text || !a || !b || !c || !d || !correct) {
      return res.status(400).json({ success: false, message: "All question fields are required" });
    }

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    const quiz = await AdminQuiz.findById(id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    if (quiz.questions.length >= quiz.limit) {
      return res.status(400).json({ success: false, message: `Max questions reached (${quiz.limit})` });
    }

    const question = {
      text,
      a,
      b,
      c,
      d,
      correct,
      image: req.file ? toPublicPath(req.file.filename || req.file.path) : null,
      marks: null, // will be computed by frontend / student as totalMarks/limit
    };

    quiz.questions.push(question);
    await quiz.save();

    // return normalized quiz with marksPerQuestion
    const marksPerQuestion = quiz.limit && quiz.limit > 0 ? Number((quiz.totalMarks / quiz.limit).toFixed(2)) : 0;
    const normalizedQuiz = quiz.toObject();
    normalizedQuiz.questions = normalizedQuiz.questions.map((qq) => ({ ...qq, image: qq.image || null }));

    return res.json({
      success: true,
      quiz: normalizedQuiz,
      question: normalizedQuiz.questions[normalizedQuiz.questions.length - 1],
      marksPerQuestion,
      message: "Question added",
    });
  } catch (err) {
    console.error("ADD QUESTION ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to add question" });
  }
};

// PUT /api/adm/quiz/:id/questions/:qId
// Accepts multipart/form-data with optional image file under 'image'
exports.updateQuestion = async (req, res) => {
  try {
    const { id, qId } = req.params;
    const { text, a, b, c, d, correct } = req.body;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(qId)) {
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    const quiz = await AdminQuiz.findById(id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    const qIndex = quiz.questions.findIndex((qq) => String(qq._id) === String(qId));
    if (qIndex === -1) return res.status(404).json({ success: false, message: "Question not found" });

    const q = quiz.questions[qIndex];

    // if new image uploaded, remove old file (best effort)
    if (req.file) {
      try {
        if (q.image) {
          const old = path.join(__dirname, "..", q.image.replace(/^\/+/, ""));
          if (fs.existsSync(old)) fs.unlinkSync(old);
        }
      } catch (e) {
        console.warn("Failed to delete old question image:", e);
      }
      q.image = toPublicPath(req.file.filename || req.file.path);
    }

    if (typeof text !== "undefined") q.text = text;
    if (typeof a !== "undefined") q.a = a;
    if (typeof b !== "undefined") q.b = b;
    if (typeof c !== "undefined") q.c = c;
    if (typeof d !== "undefined") q.d = d;
    if (typeof correct !== "undefined") q.correct = correct;

    quiz.questions[qIndex] = q;
    await quiz.save();

    const normalizedQuiz = quiz.toObject();
    normalizedQuiz.questions = normalizedQuiz.questions.map((qq) => ({ ...qq, image: qq.image || null }));

    return res.json({ success: true, quiz: normalizedQuiz, question: q, message: "Question updated" });
  } catch (err) {
    console.error("UPDATE QUESTION ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to update question" });
  }
};

// DELETE /api/adm/quiz/:id/questions/:qId
exports.deleteQuestion = async (req, res) => {
  try {
    const { id, qId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(qId)) {
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    const quiz = await AdminQuiz.findById(id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    const removedQuestion = quiz.questions.find((qq) => String(qq._id) === String(qId));
    if (!removedQuestion) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    // delete image file (best effort)
    try {
      if (removedQuestion.image) {
        const filepath = path.join(__dirname, "..", removedQuestion.image.replace(/^\/+/, ""));
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      }
    } catch (e) {
      console.warn("Failed to delete question image:", e);
    }

    quiz.questions = quiz.questions.filter((qq) => String(qq._id) !== String(qId));
    await quiz.save();

    const normalizedQuiz = quiz.toObject();
    normalizedQuiz.questions = normalizedQuiz.questions.map((qq) => ({ ...qq, image: qq.image || null }));

    return res.json({ success: true, quiz: normalizedQuiz, message: "Question deleted" });
  } catch (err) {
    console.error("DELETE QUESTION ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to delete question" });
  }
};
