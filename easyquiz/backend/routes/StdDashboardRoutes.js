const express = require("express");
const router = express.Router();

const { auth, studentOnly } = require("../middlewere/authMiddleware");

// Temporary working endpoint
router.get("/", auth, studentOnly, (req, res) => {
  res.json({
    success: true,
    message: "Student dashboard route working",
    user: req.user,
  });
});

module.exports = router;
