// backend/controllers/StdSubjectController.js

const AdmSubject = require("../models/AdmSubject");
const Student = require("../models/Student");
const Grade = require("../models/Grade");
const mongoose = require("mongoose");

async function resolveStudentGrade(student) {
  if (!student || !student.grade) return null;

  const gradeDoc = await Grade.findById(student.grade).lean();
  if (!gradeDoc) return null;

  return {
    gradeId: String(gradeDoc._id),
    name: gradeDoc.name,
  };
}

exports.getSubjectsForStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const gradeInfo = await resolveStudentGrade(student);
    if (!gradeInfo) {
      return res.json({
        success: true,
        subjects: [],
        message: "No grade assigned",
      });
    }

    const subjects = await AdmSubject.find({ grade: gradeInfo.gradeId })
      .select("name units grade")
      .sort({ name: 1 })
      .lean();

    const normalized = subjects.map((s) => ({
      _id: s._id,
      name: s.name,
      units: (s.units || []).map((u) => ({
        _id: u._id,
        name: u.name,
        content: u.content,
      })),
    }));

    return res.json({
      success: true,
      subjects: normalized,
      grade: gradeInfo,
    });

  } catch (err) {
    console.error("GET SUBJECTS FOR STUDENT ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch subjects" });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid subject ID" });
    }

    const student = await Student.findById(req.user.id).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const gradeInfo = await resolveStudentGrade(student);
    if (!gradeInfo) {
      return res.status(400).json({ success: false, message: "Student has no grade assigned" });
    }

    const subject = await AdmSubject.findById(id).lean();
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    if (String(subject.grade) !== String(gradeInfo.gradeId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Subject does not belong to your grade.",
      });
    }

    const normalized = {
      _id: subject._id,
      name: subject.name,
      units: (subject.units || []).map((u) => ({
        _id: u._id,
        name: u.name,
        content: u.content,
      })),
    };

    return res.json({
      success: true,
      subject: normalized,
      grade: gradeInfo,
    });

  } catch (err) {
    console.error("GET SUBJECT BY ID ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subject",
    });
  }
};
