const mongoose = require("mongoose");
const Notification = require("../models/Notification");

/**
 * Reusable helper — called from other controllers (claimController, etc.)
 * Emits a real-time socket event to the receiver if they are online.
 */
async function createNotification(io, { receiverId, senderId, itemId, notificationType, message }) {
  const notification = await Notification.create({
    receiverId,
    senderId: senderId || null,
    itemId: itemId || null,
    notificationType,
    message,
  });

  const populated = await Notification.findById(notification._id)
    .populate("senderId", "name")
    .populate("itemId", "title")
    .lean();

  if (io) {
    io.to(`user:${receiverId.toString()}`).emit("newNotification", populated);
  }

  return populated;
}

/**
 * GET /api/notifications
 * Returns the logged-in user's notifications, newest first.
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user })
      .populate("senderId", "name")
      .populate("itemId", "title")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read.
 */
const markAsRead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, receiverId: req.user },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark all of the user's notifications as read.
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ receiverId: req.user, isRead: false }, { isRead: true });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a single notification (owner only).
 */
const deleteNotification = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      receiverId: req.user,
    });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
