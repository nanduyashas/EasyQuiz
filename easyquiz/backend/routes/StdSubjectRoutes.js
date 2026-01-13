const express = require("express");
const router = express.Router();

const { auth, studentOnly } = require("../middlewere/authMiddleware");
const StdSubjectController = require("../controllers/StdSubjectController");

router.get("/", auth, studentOnly, StdSubjectController.getSubjectsForStudent);
router.get("/:id", auth, studentOnly, StdSubjectController.getSubjectById);

module.exports = router;
