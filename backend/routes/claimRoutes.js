const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createClaim,
  getItemClaims,
  updateClaimStatus,
  previewClaimMatch,
} = require("../controllers/claimController");
const { sendClaimOtp, verifyClaimOtp } = require("../controllers/claimOtpController");

// OTP for claim verification
router.post("/send-otp", protect, sendClaimOtp);
router.post("/verify-otp", protect, verifyClaimOtp);

// AI match preview
router.post("/preview-match", protect, previewClaimMatch);

// Claim CRUD
router.post("/create", protect, createClaim);
router.get("/item/:itemId", protect, getItemClaims);
router.put("/:id", protect, updateClaimStatus);

module.exports = router;
