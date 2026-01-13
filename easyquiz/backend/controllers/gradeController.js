// backend/controllers/gradeController.js
const Grade = require("../models/Grade");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

/* ============================================================
   GET ALL GRADES + STUDENT COUNT
   ============================================================ */
exports.getGrades = async (req, res) => {
  try {
    const grades = await Grade.find().lean();
    const students = await Student.find().lean();

    const synced = grades.map((g) => {
      const st = students.filter(
        (s) => String(s.grade) === String(g._id)
      );

      return {
        ...g,
        students: st.map((s) => ({
          studentId: s._id,
          name: s.name,
          email: s.email,
          registeredAt: s.createdAt
        }))
      };
    });

    return res.json({ success: true, grades: synced });

  } catch (err) {
    console.error("GET GRADES ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load grades"
    });
  }
};


/* ============================================================
   ADD GRADE
   ============================================================ */
exports.addGrade = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Grade name is required"
      });
    }

    const exists = await Grade.findOne({ name });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Grade already exists"
      });
    }

    const created = await Grade.create({ name });

    return res.json({
      success: true,
      message: "Grade added",
      grade: created
    });

  } catch (err) {
    console.error("ADD GRADE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add grade"
    });
  }
};


/* ============================================================
   REMOVE GRADE + DELETE STUDENTS INSIDE
   ============================================================ */
exports.removeGrade = async (req, res) => {
  try {
    const { name } = req.body;

    const removed = await Grade.findOneAndDelete({ name });

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Grade not found"
      });
    }

    // delete all students who belong to this grade
    await Student.deleteMany({ grade: removed._id });

    return res.json({
      success: true,
      message: "Grade & its students removed successfully"
    });

  } catch (err) {
    console.error("REMOVE GRADE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove grade"
    });
  }
};


/* ============================================================
   ADD STUDENT TO GRADE
   ============================================================ */
exports.addStudent = async (req, res) => {
  try {
    const { gradeName, name, email } = req.body;

    if (!gradeName || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }

    const grade = await Grade.findOne({ name: gradeName });
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found"
      });
    }

    // check duplicate email
    const existsStudent = await Student.findOne({ email });
    if (existsStudent) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // auto-generate password
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(plainPassword, 10);

    // create student
    const student = await Student.create({
      name,
      email,
      grade: grade._id, // IMPORTANT: store ObjectId
      password: hashed,
      role: "student"
    });

    // push inside Grade.students[]
    grade.students.push({
      studentId: student._id.toString(),
      name,
      email,
      registeredAt: new Date()
    });
    await grade.save();

    return res.json({
      success: true,
      message: "Student added successfully",
      student,
      grade,
      login: {
        email,
        password: plainPassword
      }
    });

  } catch (err) {
    console.error("ADD STUDENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add student"
    });
  }
};


/* ============================================================
   REMOVE STUDENT FROM GRADE + DB
   ============================================================ */
exports.removeStudent = async (req, res) => {
  try {
    const { gradeName, studentId } = req.body;

    const grade = await Grade.findOne({ name: gradeName });
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found"
      });
    }

    // remove from Grade.students[]
    grade.students = grade.students.filter(
      (s) => s.studentId !== String(studentId)
    );
    await grade.save();

    // remove from Student collection
    await Student.findByIdAndDelete(studentId);

    return res.json({
      success: true,
      message: "Student removed successfully",
      grade
    });

  } catch (err) {
    console.error("REMOVE STUDENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove student"
    });
  }
};
