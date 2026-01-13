const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: { type: String, default: "student" },

    // ⭐ Grade stored as NAME instead of ObjectId
    grade: { type: String, required: true },  // Example: "Grade 6"

    profileImage: { type: String, default: "" },

    // Optional: quiz stats
    quizzesTaken: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
