// backend/models/AdmSubject.js
const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
});

const AdmSubjectSchema = new mongoose.Schema(
  {
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",   // 🔥 FIXED — must match your real Grade model
      required: true,
    },
    name: { type: String, required: true },
    units: [UnitSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdmSubject", AdmSubjectSchema);