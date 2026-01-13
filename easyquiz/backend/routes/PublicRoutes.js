const express = require("express");
const router = express.Router();

const Grade = require("../models/AdminGrades"); // your grade model name

// PUBLIC: Get all grades (NO AUTH)
router.get("/grades", async (req, res) => {
  try {
    const grades = await Grade.find().sort({ createdAt: 1 });

    res.json({
      success: true,
      grades,
    });
  } catch (err) {
    console.error("PUBLIC GRADES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load grades",
    });
  }
});

module.exports = router;
