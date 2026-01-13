// backend/models/Student.js
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    role: { type: String, default: "student" },

    profileImage: { type: String, default: "" },

    // ⭐ Must be ObjectId referencing Grade
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
