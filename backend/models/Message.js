const mongoose = require("mongoose");

/**
 * One-to-one messages inside a ChatRoom.
 * deliveryStatus: sent (persisted) → delivered (recipient online / room) → read (seen)
 */
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },

    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    /** Legacy / explicit flag; also reflected in deliveryStatus === "read" */
    isSeen: {
      type: Boolean,
      default: false,
    },

    /** Same as createdAt for API contract; kept in sync on save */
    timestamp: {
      type: Date,
      default: Date.now,
    },

    deliveryStatus: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    seenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ chatRoomId: 1, createdAt: -1 });
messageSchema.index({ chatRoomId: 1, receiverId: 1, isSeen: 1 });

messageSchema.pre("save", function() {
  if (this.isNew) {
    this.timestamp = this.createdAt || new Date();
  }
});

module.exports = mongoose.model("Message", messageSchema);
