// backend/routes/AdmQuizRoutes.js
const express = require("express");
const router = express.Router();
const admQuizController = require("../controllers/admQuizController");
const { auth, adminOnly } = require("../middlewere/authMiddleware");
const upload = require("../middlewere/upload");

// protect routes for admins
router.use(auth);
router.use(adminOnly);

// GET all (with optional filters)
router.get("/", admQuizController.getQuizzes);

// GET single quiz
router.get("/:id", admQuizController.getQuizById);

// CREATE quiz (JSON body)
router.post("/", admQuizController.createQuiz);

// UPDATE quiz meta (JSON body)
router.put("/:id", admQuizController.updateQuiz);

// DELETE quiz
router.delete("/:id", admQuizController.deleteQuiz);

// ADD question to quiz (multipart/form-data) - image optional
router.post("/:id/questions", upload.single("image"), admQuizController.addQuestion);

// UPDATE question (multipart/form-data) - image optional
router.put("/:id/questions/:qId", upload.single("image"), admQuizController.updateQuestion);

// DELETE question
router.delete("/:id/questions/:qId", admQuizController.deleteQuestion);

module.exports = router;
