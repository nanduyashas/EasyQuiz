const AdmSubject = require("../models/AdmSubject");
const Grade = require("../models/Grade");
const mongoose = require("mongoose");

// GET subjects by grade
exports.getSubjectsByGrade = async (req, res) => {
  try {
    const { gradeId } = req.query;

    if (!gradeId) {
      return res.json({ success: true, subjects: [] });
    }

    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gradeId",
      });
    }

    const subjects = await AdmSubject.find({ grade: gradeId })
      .select("name units")
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      subjects,
    });

  } catch (err) {
    console.error("GET SUBJECTS ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch subjects" });
  }
};

// ADD subject to a grade
exports.addSubject = async (req, res) => {
  try {
    const { gradeId, name } = req.body;

    if (!gradeId || !name) {
      return res.status(400).json({
        success: false,
        message: "gradeId and name are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gradeId",
      });
    }

    const exists = await AdmSubject.findOne({
      grade: gradeId,
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Subject "${name}" already exists`,
      });
    }

    const subject = await AdmSubject.create({
      grade: gradeId,
      name,
      units: [],
    });

    return res.json({
      success: true,
      subject,
    });

  } catch (err) {
    console.error("ADD SUBJECT ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to add subject" });
  }
};

// REMOVE subject
exports.removeSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: "Invalid subjectId" });
    }

    await AdmSubject.findByIdAndDelete(subjectId);

    return res.json({ success: true, message: "Subject removed" });

  } catch (err) {
    console.error("REMOVE SUBJECT ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to delete subject" });
  }
};

// ADD unit to subject
exports.addUnit = async (req, res) => {
  try {
    const { subjectId, name, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: "Invalid subjectId" });
    }

    const subject = await AdmSubject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });

    subject.units.push({ name, content });
    await subject.save();

    return res.json({ success: true, subject });

  } catch (err) {
    console.error("ADD UNIT ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to add unit" });
  }
};

// REMOVE unit
exports.removeUnit = async (req, res) => {
  try {
    const { subjectId, unitId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: "Invalid subjectId" });
    }

    const subject = await AdmSubject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });

    subject.units = subject.units.filter((u) => String(u._id) !== String(unitId));
    await subject.save();

    return res.json({ success: true, subject });

  } catch (err) {
    console.error("REMOVE UNIT ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to remove unit" });
  }
};