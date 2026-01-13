// backend/routes/AdmDashboardRoutes.js

const express = require("express");
const router = express.Router();

// FIXED: must match your folder name "middlewere"
const auth = require("../middlewere/auth");
const { adminOnly } = require("../middlewere/authMiddleware");

// Controller
const { getDashboardData } = require("../controllers/AdmDashboardController");

// Dashboard Route
router.get("/", auth, adminOnly, getDashboardData);

module.exports = router;
