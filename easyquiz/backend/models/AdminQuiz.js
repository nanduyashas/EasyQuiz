// backend/models/AdminQuiz.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ============================
   QUESTION SCHEMA
   ============================ */
const QuestionSchema = new Schema(
  {
    text: { type: String, required: true },
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },

    correct: { type: String, required: true }, // 'a' | 'b' | 'c' | 'd'

    image: { type: String, default: null }, // /uploads/... image url

    // optional per-question mark — auto-calculated normally
    marks: { type: Number, default: null },
  },
  { timestamps: true }
);

/* ============================
   ADMIN QUIZ SCHEMA
   ============================ */
const AdminQuizSchema = new Schema(
  {
    grade: { type: String, required: true },
    gradeId: { type: mongoose.Types.ObjectId, ref: "Grade", default: null },

    subject: { type: String, required: true },
    subjectId: { type: mongoose.Types.ObjectId, ref: "AdmSubject", default: null },

    unit: { type: String, default: "All Units" },

   
    description: { type: String, default: "" },

    limit: { type: Number, default: 1 }, // total questions allowed

    // quiz total marks
    totalMarks: { type: Number, default: 100, required: true },

    // time duration (in minutes)
    timeMinutes: { type: Number, required: true },

    // NEW FIELD ⭐
    affectsRank: {
      type: Boolean,
      default: false,   // if true → used in final ranking
      required: true,
    },

    // array of questions
    questions: { type: [QuestionSchema], default: [] },

    // metadata
    createdBy: { type: mongoose.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminQuiz", AdminQuizSchema);
