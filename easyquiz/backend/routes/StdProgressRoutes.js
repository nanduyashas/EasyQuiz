const express = require("express");
const router = express.Router();

const { auth, studentOnly } = require("../middlewere/authMiddleware");

router.get("/", auth, studentOnly, (req, res) => {
  res.json({
    success: true,
    message: "Student progress route working",
  });
});

module.exports = router;
