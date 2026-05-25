const mongoose = require("mongoose");
const User = require("../models/User");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const Message = require("../models/Message");

const getDashboard = async (req, res) => {
  try {
    const itemBase = { isRemoved: { $ne: true } };
    const [
      totalUsers,
      bannedUsers,
      totalItems,
      openItems,
      unresolvedItems,
      lostReports,
      foundItems,
      pendingClaims,
      approvedClaims,
      recentItems,
      recentClaims,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Item.countDocuments(itemBase),
      Item.countDocuments({ ...itemBase, status: "open" }),
      Item.countDocuments({
        ...itemBase,
        status: { $in: ["open", "claimed"] },
      }),
      Item.countDocuments({ ...itemBase, type: "lost" }),
      Item.countDocuments({ ...itemBase, type: "found" }),
      Claim.countDocuments({ status: "pending" }),
      Claim.countDocuments({ status: "approved" }),
      Item.find(itemBase)
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("postedBy", "name email"),
      Claim.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("itemId", "title type status")
        .populate("claimantUserId", "name email"),
    ]);

    res.json({
      totals: {
        users: totalUsers,
        bannedUsers,
        items: totalItems,
        openItems,
        unresolvedItems,
        lostReports,
        foundItems,
        pendingClaims,
        approvedClaims,
      },
      recentItems,
      recentClaims,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const banUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (String(user._id) === String(req.user)) {
      return res.status(400).json({ message: "You cannot ban yourself" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot ban an admin account" });
    }
    user.isBanned = true;
    user.bannedAt = new Date();
    user.bannedReason = reason ? String(reason).trim().slice(0, 500) : "Policy violation";
    await user.save();
    res.json({ message: "User banned", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unbanUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBanned = false;
    user.bannedAt = null;
    user.bannedReason = "";
    await user.save();
    res.json({ message: "User unbanned", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getModerationItems = async (req, res) => {
  try {
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name email isBanned");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }
    const { reason } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    item.isRemoved = true;
    item.removedAt = new Date();
    item.removedReason = reason
      ? String(reason).trim().slice(0, 500)
      : "Removed by moderator";
    await item.save();
    res.json({ message: "Item removed", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restoreItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      {
        isRemoved: false,
        removedAt: null,
        removedReason: "",
      },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item restored", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllClaimsAdmin = async (req, res) => {
  try {
    const claims = await Claim.find()
      .sort({ createdAt: -1 })
      .populate("itemId", "title type status postedBy")
      .populate("claimantUserId", "name email");
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActivitySummary = async (req, res) => {
  try {
    const [messageCount, itemCountLast7d] = await Promise.all([
      Message.countDocuments(),
      Item.countDocuments({
        isRemoved: { $ne: true },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);
    res.json({ messageCount, itemCountLast7d });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  banUser,
  unbanUser,
  getModerationItems,
  removeItem,
  restoreItem,
  getAllClaimsAdmin,
  getActivitySummary,
};
