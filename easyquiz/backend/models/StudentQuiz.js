const mongoose = require("mongoose");

const studentQuizSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminQuiz",
      required: true,
      index: true,
    },

    title: String,
    grade: String,
    subject: String,
    unit: String,

    score: {
      type: Number,
      required: true,
    },

    correctCount: Number,
    totalQuestions: Number,

    affectsRank: {
      type: Boolean,
      default: false,
    },

    timeTakenSeconds: Number,

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🚨 VERY IMPORTANT — block multiple ranked attempts
studentQuizSchema.index(
  { studentId: 1, quizId: 1 },
  { unique: true }
);

module.exports = mongoose.model("StudentQuiz", studentQuizSchema);
