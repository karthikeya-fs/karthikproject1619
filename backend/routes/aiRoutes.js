const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { generateQuestions } = require("../controllers/aiController");

// POST /api/ai/generate-questions
router.post("/generate-questions", protect, generateQuestions);

module.exports = router;
