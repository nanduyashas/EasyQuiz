// models/StudentAttempt.js
const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  selected: { type: String, enum: ["a","b","c","d", null], default: null },
  correct: { type: String, enum: ["a","b","c","d"] },
}, { _id: false });

const StudentAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  title: { type: String },
  grade: { type: String },
  subject: { type: String },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  ranked: { type: Boolean, default: false },
  answers: [AnswerSchema],
  correctCount: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  score: { type: Number, default: 0 }, // percent 0-100
  timeTakenSeconds: { type: Number, default: 0 },
  autoSubmitted: { type: Boolean, default: false },
  completed: { type: Boolean, default: false }, // true after final submit
  inProgress: { type: Boolean, default: true }, // toggle while saving progress
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("StudentAttempt", StudentAttemptSchema);
