const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    claimantName: { type: String, required: true },
    claimantEmail: { type: String, required: true },
    rollNumber: { type: String, default: "" },

    /** Logged-in user who submitted the claim (used for secure chat access). */
    claimantUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    message: { type: String, required: true },

    /** AI-generated ownership verification questions saved at claim time */
    aiQuestions: [{ type: String }],

    /** Claimant's answers to the AI questions */
    verificationAnswers: [{ type: String }],

    /** Whether the claimant completed OTP verification */
    otpVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    /** AI ownership match vs found item details */
    aiMatchPercentage: { type: Number, min: 0, max: 100, default: null },
    confidenceLevel: {
      type: String,
      enum: ["high", "medium", "low", "very_low"],
    },
    verificationStatus: {
      type: String,
      enum: ["auto_verified", "high_confidence", "needs_review", "low_match"],
    },
    aiSummary: { type: String, default: "" },
    aiRecommendation: { type: String, default: "" },
    matchedFields: [
      {
        label: String,
        matched: Boolean,
        score: Number,
      },
    ],
    imageVerification: {
      enabled: { type: Boolean, default: false },
      placeholder: { type: Boolean, default: true },
      score: { type: Number, default: null },
      note: { type: String, default: "" },
    },
    reviewedByOwner: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);