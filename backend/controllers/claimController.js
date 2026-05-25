const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const User = require("../models/User");
const Item = require("../models/Item");
const { createNotification } = require("./notificationController");
const { runAIVerification } = require("../utils/aiMatchVerification");

function pickAiNotifType(percentage) {
  if (percentage >= 85) return "ai_high_match";
  if (percentage >= 70) return "ai_medium_match";
  return "ai_low_match";
}

/**
 * POST /api/claims/create
 */
const createClaim = async (req, res) => {
  try {
    const {
      itemId,
      message,
      rollNumber,
      aiQuestions,
      verificationAnswers,
      otpVerified,
    } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({ message: "itemId and message are required" });
    }

    const user = await User.findById(req.user).select("name email");
    if (!user) return res.status(401).json({ message: "User not found" });

    const existing = await Claim.findOne({
      itemId,
      claimantUserId: user._id,
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({ message: "You already have a pending claim for this item." });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const claimPayload = {
      message: String(message).trim().slice(0, 2000),
      verificationAnswers: Array.isArray(verificationAnswers) ? verificationAnswers.slice(0, 2) : [],
    };
    const aiResult = runAIVerification(item, claimPayload);

    const claim = await Claim.create({
      itemId,
      claimantName: user.name,
      claimantEmail: user.email,
      rollNumber: rollNumber ? String(rollNumber).trim() : "",
      message: claimPayload.message,
      claimantUserId: user._id,
      aiQuestions: Array.isArray(aiQuestions) ? aiQuestions.slice(0, 2) : [],
      verificationAnswers: claimPayload.verificationAnswers,
      otpVerified: Boolean(otpVerified),
      aiMatchPercentage: aiResult.aiMatchPercentage,
      confidenceLevel: aiResult.confidenceLevel,
      verificationStatus: aiResult.verificationStatus,
      aiSummary: aiResult.aiSummary,
      aiRecommendation: aiResult.aiRecommendation,
      matchedFields: aiResult.matchedFields,
      imageVerification: aiResult.imageVerification,
      reviewedByOwner: false,
    });

    try {
      if (item && String(item.postedBy) !== String(user._id)) {
        const io = req.app.get("io");
        const pct = aiResult.aiMatchPercentage;
        await createNotification(io, {
          receiverId: item.postedBy,
          senderId: user._id,
          itemId: item._id,
          notificationType: "item_claimed",
          message: `${user.name} claimed "${item.title}" — AI match ${pct}%`,
        });
        await createNotification(io, {
          receiverId: item.postedBy,
          senderId: user._id,
          itemId: item._id,
          notificationType: pickAiNotifType(pct),
          message: `AI found a ${pct}% match for your found item "${item.title}". ${aiResult.aiSummary}`,
        });
        await createNotification(io, {
          receiverId: user._id,
          senderId: item.postedBy,
          itemId: item._id,
          notificationType: "ai_verification_complete",
          message: `Claim verification completed — ${pct}% match (${aiResult.confidenceLevel} confidence).`,
        });
      }
    } catch (notifErr) {
      console.warn("[Notification] Failed to create claim notification:", notifErr.message);
    }

    res.status(201).json({
      message: "Claim submitted successfully",
      claim,
      verification: aiResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/claims/item/:itemId
 */
const getItemClaims = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const claims = await Claim.find({ itemId })
      .populate("itemId")
      .sort({ aiMatchPercentage: -1, createdAt: -1 });
    const isOwner = String(item.postedBy) === String(req.user);

    if (isOwner) return res.json(claims);

    const myClaims = claims.filter(
      (c) => String(c.claimantUserId) === String(req.user)
    );
    return res.json(myClaims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/claims/:id
 * Approve or reject a claim — notifies the claimant.
 */
const updateClaimStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid claim ID" });
    }

    const claim = await Claim.findById(req.params.id).populate("itemId");
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const item = claim.itemId;
    const isOwner = String(item.postedBy) === String(req.user);
    const isAdmin = req.userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Only the item owner or an admin can update claim status" });
    }

    const prevStatus = claim.status;
    claim.status = req.body.status;
    if (isOwner || isAdmin) claim.reviewedByOwner = true;
    await claim.save();

    if (req.body.status === "approved") {
      await Item.findByIdAndUpdate(item._id, { status: "claimed" });
    } else if (req.body.status === "rejected") {
      const pending = await Claim.countDocuments({
        itemId: item._id,
        status: "pending",
        _id: { $ne: claim._id },
      });
      if (pending === 0 && item.status === "claimed") {
        await Item.findByIdAndUpdate(item._id, { status: "open" });
      }
    }

    // Notify the claimant if status actually changed
    if (claim.claimantUserId && req.body.status !== prevStatus) {
      try {
        const io = req.app.get("io");
        const notifType = req.body.status === "approved" ? "claim_approved" : "claim_rejected";
        const notifMsg =
          req.body.status === "approved"
            ? `Your claim for "${item.title}" has been approved!`
            : `Your claim for "${item.title}" has been rejected.`;

        await createNotification(io, {
          receiverId: claim.claimantUserId,
          senderId: req.user,
          itemId: item._id,
          notificationType: notifType,
          message: notifMsg,
        });
      } catch (notifErr) {
        console.warn("[Notification] Failed to create status notification:", notifErr.message);
      }
    }

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/claims/preview-match
 * Preview AI score before final claim submit.
 */
const previewClaimMatch = async (req, res) => {
  try {
    const { itemId, message, verificationAnswers } = req.body;
    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const verification = runAIVerification(item, {
      message: message || "",
      verificationAnswers: Array.isArray(verificationAnswers) ? verificationAnswers : [],
    });

    res.json({ verification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClaim, getItemClaims, updateClaimStatus, previewClaimMatch };
