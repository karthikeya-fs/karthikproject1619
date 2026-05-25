const mongoose = require("mongoose");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const User = require("../models/User");
const ChatRoom = require("../models/ChatRoom");

/**
 * Resolve approved claim for an item (single active conversation).
 */
async function findApprovedClaimForItem(itemId) {
  return Claim.findOne({
    itemId,
    status: "approved",
  }).sort({ updatedAt: -1 });
}

/**
 * Resolve claimant Mongo id from claim (ObjectId or lookup by email).
 */
async function resolveClaimantId(claim) {
  if (claim.claimantUserId) return claim.claimantUserId;
  if (!claim.claimantEmail) return null;
  const email = String(claim.claimantEmail).trim().toLowerCase();
  const user = await User.findOne({
    $expr: { $eq: [{ $toLower: "$email" }, email] },
  }).select("_id");
  return user?._id || null;
}

/**
 * Returns { role: 'finder'|'claimant', item, claim, finderId, claimantId } or throws { status, message }.
 */
async function assertUserCanAccessItemChat(userId, itemId) {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    const err = new Error("Invalid item");
    err.status = 400;
    throw err;
  }

  const item = await Item.findById(itemId);
  if (!item) {
    const err = new Error("Item not found");
    err.status = 404;
    throw err;
  }

  if (!item.postedBy) {
    const err = new Error("This item has no owner on file; chat is unavailable.");
    err.status = 403;
    throw err;
  }

  const uid = userId.toString();
  const finderId = item.postedBy.toString();

  if (finderId === uid) {
    const claim = await findApprovedClaimForItem(item._id);
    if (!claim) {
      const err = new Error("No approved claimant yet. Chat opens after a claim is approved.");
      err.status = 403;
      throw err;
    }
    const claimantId = await resolveClaimantId(claim);
    if (!claimantId) {
      const err = new Error("Approved claim is missing a linked user account for chat.");
      err.status = 403;
      throw err;
    }
    return { role: "finder", item, claim, finderId: item.postedBy, claimantId };
  }

  const claim = await findApprovedClaimForItem(item._id);
  if (!claim) {
    const err = new Error("No approved claim for this item.");
    err.status = 403;
    throw err;
  }

  const claimantId = await resolveClaimantId(claim);
  if (!claimantId || claimantId.toString() !== uid) {
    const err = new Error("You are not the verified claimant for this item.");
    err.status = 403;
    throw err;
  }

  return { role: "claimant", item, claim, finderId: item.postedBy, claimantId };
}

/**
 * User must be one of the two participants.
 */
async function assertUserInRoom(userId, roomId) {
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    const err = new Error("Invalid room");
    err.status = 400;
    throw err;
  }
  const room = await ChatRoom.findById(roomId);
  if (!room) {
    const err = new Error("Chat room not found");
    err.status = 404;
    throw err;
  }
  const ok = room.participants.some((p) => p.toString() === userId.toString());
  if (!ok) {
    const err = new Error("Not allowed to access this chat");
    err.status = 403;
    throw err;
  }
  return room;
}

module.exports = {
  assertUserCanAccessItemChat,
  assertUserInRoom,
  findApprovedClaimForItem,
  resolveClaimantId,
};
