const mongoose = require("mongoose");

/**
 * One chat room per lost/found item between the finder (item owner) and the approved claimant.
 * Only those two user IDs may access messages (enforced in API + Socket.io).
 */
const chatRoomSchema = new mongoose.Schema(
  {
    /** Exactly two participants: [finderUserId, claimantUserId] */
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      unique: true,
    },

    /** Last message preview (no PII beyond display name context in app) */
    lastMessageText: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

chatRoomSchema.index({ participants: 1 });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
