// routes/StdAttemptRoutes.js
const express = require("express");
const router = express.Router();
const attemptController = require("../controllers/attemptController");
const { isStudent } = require("../middlewares/authMiddleware");

// Start attempt
router.post("/start", isStudent, attemptController.startAttempt);

// Save progress
router.patch("/save/:attemptId", isStudent, attemptController.saveProgress);

// Submit
router.post("/submit/:attemptId", isStudent, attemptController.submitAttempt);

// History
router.get("/history", isStudent, attemptController.getHistory);

module.exports = router;
