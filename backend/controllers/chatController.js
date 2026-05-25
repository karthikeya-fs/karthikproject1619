const mongoose = require("mongoose");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const User = require("../models/User");
const Item = require("../models/Item");
const sanitizeMessageText = require("../utils/sanitizeMessage");
const {
  assertUserCanAccessItemChat,
  assertUserInRoom,
} = require("../utils/chatAccess");

function emitToRoom(io, roomId, event, payload) {
  if (!io) return;
  io.to(`room:${roomId}`).emit(event, payload);
}

function emitToUser(io, userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

/**
 * Public-safe user shape (no email / phone).
 */
function safeUser(u) {
  if (!u) return null;
  return {
    _id: u._id,
    name: u.name,
    department: u.department || "",
    profileImage: u.profileImage || null,
  };
}

/**
 * POST /api/chat/create-room  { itemId }
 */
const createRoom = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    const access = await assertUserCanAccessItemChat(req.user, itemId);
    const { finderId, claimantId, item } = access;

    const p1 = finderId.toString();
    const p2 = claimantId.toString();
    const participants =
      p1 < p2
        ? [finderId, claimantId]
        : [claimantId, finderId];

    let room = await ChatRoom.findOne({ lostItemId: item._id });
    if (!room) {
      room = await ChatRoom.create({
        participants,
        lostItemId: item._id,
      });
    } else {
      const same =
        room.participants.length === 2 &&
        room.participants.map(String).sort().join() ===
          [p1, p2].sort().join();
      if (!same) {
        return res.status(409).json({ message: "Chat room participants conflict" });
      }
    }

    const otherId =
      finderId.toString() === req.user.toString() ? claimantId : finderId;
    const other = await User.findById(otherId).select("name department profileImage");

    res.status(200).json({
      room: {
        _id: room._id,
        lostItemId: room.lostItemId,
        participants: room.participants,
        createdAt: room.createdAt,
      },
      itemTitle: item.title,
      otherUser: safeUser(other),
    });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ message: e.message || "Could not create room" });
  }
};

/**
 * GET /api/chat/:roomId
 */
const getRoom = async (req, res) => {
  try {
    const room = await assertUserInRoom(req.user, req.params.roomId);
    const item = await Item.findById(room.lostItemId).select("title type status");

    const otherId = room.participants.find((p) => p.toString() !== req.user.toString());
    const other = await User.findById(otherId).select("name department profileImage");

    const unread = await Message.countDocuments({
      chatRoomId: room._id,
      receiverId: req.user,
      isSeen: false,
    });

    res.json({
      room: {
        _id: room._id,
        lostItemId: room.lostItemId,
        participants: room.participants,
        lastMessageText: room.lastMessageText,
        lastMessageAt: room.lastMessageAt,
        createdAt: room.createdAt,
      },
      item,
      otherUser: safeUser(other),
      unreadCount: unread,
    });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ message: e.message || "Error" });
  }
};

/**
 * GET /api/chat/messages/:roomId?cursor=&limit=
 */
const getMessages = async (req, res) => {
  try {
    const room = await assertUserInRoom(req.user, req.params.roomId);
    const limit = Math.min(parseInt(req.query.limit, 10) || 40, 100);
    const cursor = req.query.cursor;

    const query = { chatRoomId: room._id };
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .populate("senderId", "name department profileImage")
      .populate("receiverId", "name department profileImage")
      .lean();

    const chronological = [...messages].reverse();
    const formatted = chronological.map((m) => ({
      _id: m._id,
      chatRoomId: m.chatRoomId,
      senderId: m.senderId?._id || m.senderId,
      text: m.text,
      timestamp: m.timestamp || m.createdAt,
      createdAt: m.createdAt,
      isSeen: m.isSeen,
      deliveryStatus: m.deliveryStatus,
      deliveredAt: m.deliveredAt,
      seenAt: m.seenAt,
      sender: m.senderId ? { _id: m.senderId._id, name: m.senderId.name, profileImage: m.senderId.profileImage || null } : null,
      receiver: m.receiverId ? { _id: m.receiverId._id, name: m.receiverId.name, profileImage: m.receiverId.profileImage || null } : null,
    }));

    res.json({
      messages: formatted,
      nextCursor:
        chronological.length === limit
          ? chronological[0]._id.toString()
          : null,
    });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ message: e.message || "Error" });
  }
};

async function persistAndBroadcastMessage({ io, room, senderId, text }) {
  const rid = room._id.toString();
  const receiverId = room.participants.find((p) => p.toString() !== senderId.toString());
  if (!receiverId) throw new Error("Invalid room participants");

  const clean = sanitizeMessageText(text);
  if (!clean) {
    const err = new Error("Message cannot be empty");
    err.status = 400;
    throw err;
  }

  const msg = await Message.create({
    senderId,
    receiverId,
    chatRoomId: room._id,
    text: clean,
    deliveryStatus: "sent",
    timestamp: new Date(),
  });

  await ChatRoom.findByIdAndUpdate(room._id, {
    lastMessageText: clean.slice(0, 120),
    lastMessageAt: new Date(),
  });

  const populated = await Message.findById(msg._id)
    .populate("senderId", "name department profileImage")
    .populate("receiverId", "name department profileImage")
    .lean();

  const payload = {
    _id: populated._id,
    chatRoomId: populated.chatRoomId,
    senderId: populated.senderId?._id || populated.senderId,
    receiverId: populated.receiverId?._id || populated.receiverId,
    text: populated.text,
    timestamp: populated.timestamp || populated.createdAt,
    createdAt: populated.createdAt,
    isSeen: populated.isSeen,
    deliveryStatus: populated.deliveryStatus,
    sender: populated.senderId
      ? { _id: populated.senderId._id, name: populated.senderId.name, profileImage: populated.senderId.profileImage || null }
      : null,
    receiver: populated.receiverId
      ? { _id: populated.receiverId._id, name: populated.receiverId.name, profileImage: populated.receiverId.profileImage || null }
      : null,
  };

  emitToRoom(io, rid, "receiveMessage", payload);

  /** Delivery: notify sender if recipient is connected (any socket in user room). */
  const ioRef = io;
  if (ioRef) {
    try {
      const receiverSockets = await ioRef
        .in(`user:${receiverId.toString()}`)
        .fetchSockets();
      if (receiverSockets.length > 0) {
        await Message.findByIdAndUpdate(msg._id, {
          deliveryStatus: "delivered",
          deliveredAt: new Date(),
        });
        payload.deliveryStatus = "delivered";
        payload.deliveredAt = new Date();
        emitToUser(ioRef, senderId.toString(), "messageDelivered", {
          messageId: msg._id.toString(),
          chatRoomId: rid,
          deliveryStatus: "delivered",
        });
      }
    } catch (e) {
      console.warn("delivery check skipped:", e.message);
    }
  }

  return payload;
}

/**
 * POST /api/chat/send  { chatRoomId, text }
 */
const sendMessageHttp = async (req, res) => {
  try {
    const { chatRoomId, text } = req.body;
    if (!chatRoomId) {
      return res.status(400).json({ message: "chatRoomId is required" });
    }
    const room = await assertUserInRoom(req.user, chatRoomId);
    const io = req.app.get("io");
    const payload = await persistAndBroadcastMessage({
      io,
      room,
      senderId: req.user,
      text,
    });
    res.status(201).json({ ok: true, data: payload });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ message: e.message || "Send failed" });
  }
};

/**
 * GET /api/chat/my-rooms
 */
const getMyChatRooms = async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user);
    const rooms = await ChatRoom.find({ participants: uid })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("lostItemId", "title type status")
      .lean();

    const out = await Promise.all(
      rooms.map(async (r) => {
        const otherId = r.participants.find((p) => p.toString() !== req.user.toString());
        const other = await User.findById(otherId).select("name department profileImage").lean();
        const unread = await Message.countDocuments({
          chatRoomId: r._id,
          receiverId: req.user,
          isSeen: false,
        });
        return {
          _id: r._id,
          lostItemId: r.lostItemId?._id || r.lostItemId,
          itemTitle: r.lostItemId?.title || "Item",
          itemType: r.lostItemId?.type,
          lastMessageText: r.lastMessageText,
          lastMessageAt: r.lastMessageAt,
          unreadCount: unread,
          otherUser: other ? { _id: other._id, name: other.name, profileImage: other.profileImage || null } : null,
        };
      })
    );

    res.json({ rooms: out });
  } catch (e) {
    res.status(500).json({ message: e.message || "Error" });
  }
};

/**
 * POST /api/chat/mark-read/:roomId
 */
const markRoomRead = async (req, res) => {
  try {
    const room = await assertUserInRoom(req.user, req.params.roomId);
    await Message.updateMany(
      {
        chatRoomId: room._id,
        receiverId: req.user,
        isSeen: false,
      },
      {
        $set: {
          isSeen: true,
          deliveryStatus: "read",
          seenAt: new Date(),
        },
      }
    );
    const io = req.app.get("io");
    const partnerId = room.participants.find((p) => p.toString() !== req.user.toString());
    emitToUser(io, partnerId.toString(), "messagesSeen", {
      chatRoomId: room._id.toString(),
      byUserId: req.user.toString(),
    });
    res.json({ ok: true });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ message: e.message || "Error" });
  }
};

module.exports = {
  createRoom,
  getRoom,
  getMessages,
  sendMessageHttp,
  getMyChatRooms,
  markRoomRead,
  persistAndBroadcastMessage,
  emitToRoom,
  emitToUser,
};
