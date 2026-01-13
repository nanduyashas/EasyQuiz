const express = require("express");
const router = express.Router();

const auth = require("../middlewere/auth");
const { adminOnly } = require("../middlewere/authMiddleware");

const {
  getSubjectsByGrade,
  addSubject,
  removeSubject,
  addUnit,
  removeUnit,
} = require("../controllers/admSubjectController");

// 🔒 ADMIN ONLY
router.get("/", auth, adminOnly, getSubjectsByGrade);
router.post("/add", auth, adminOnly, addSubject);
router.post("/remove", auth, adminOnly, removeSubject);
router.post("/add-unit", auth, adminOnly, addUnit);
router.post("/remove-unit", auth, adminOnly, removeUnit);




module.exports = router;
