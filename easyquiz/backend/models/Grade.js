// backend/models/Grade.js
const mongoose = require("mongoose");

const studentSubSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    registeredAt: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false }
);

const GradeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    students: { type: [studentSubSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grade", GradeSchema);
