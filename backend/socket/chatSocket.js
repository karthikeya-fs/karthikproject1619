const mongoose = require("mongoose");
const { assertUserInRoom } = require("../utils/chatAccess");
const { persistAndBroadcastMessage } = require("../controllers/chatController");
const Message = require("../models/Message");

/** @type {Map<string, NodeJS.Timeout>} */
const typingTimers = new Map();

function typingKey(roomId, userId) {
  return `${roomId}:${userId}`;
}

function registerChatHandlers(io, socket) {
  const uid = socket.userId;

  // Personal channel for receipts / notifications
  socket.join(`user:${uid}`);

  socket.on("joinRoom", async (roomId, cb) => {
    try {
      if (!roomId || typeof roomId !== "string") {
        throw new Error("Invalid room");
      }
      await assertUserInRoom(uid, roomId);
      socket.join(`room:${roomId}`);
      if (typeof cb === "function") cb({ ok: true });
    } catch (e) {
      if (typeof cb === "function") cb({ ok: false, message: e.message });
    }
  });

  socket.on("leaveRoom", (roomId) => {
    if (roomId) socket.leave(`room:${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, text }, cb) => {
    try {
      const room = await assertUserInRoom(uid, roomId);
      const payload = await persistAndBroadcastMessage({
        io,
        room,
        senderId: uid,
        text,
      });
      if (typeof cb === "function") cb({ ok: true, data: payload });
    } catch (e) {
      const status = e.status || 500;
      if (typeof cb === "function") {
        cb({ ok: false, message: e.message, status });
      }
    }
  });

  socket.on("typing", async ({ roomId }) => {
    try {
      await assertUserInRoom(uid, roomId);
      socket.to(`room:${roomId}`).emit("typing", {
        userId: uid,
        userName: socket.userName,
        roomId,
      });
      const key = typingKey(roomId, uid);
      if (typingTimers.has(key)) clearTimeout(typingTimers.get(key));
      const t = setTimeout(() => {
        typingTimers.delete(key);
        socket.to(`room:${roomId}`).emit("stopTyping", { userId: uid, roomId });
      }, 3000);
      typingTimers.set(key, t);
    } catch {
      /* ignore */
    }
  });

  socket.on("stopTyping", async ({ roomId }) => {
    try {
      await assertUserInRoom(uid, roomId);
      const key = typingKey(roomId, uid);
      if (typingTimers.has(key)) {
        clearTimeout(typingTimers.get(key));
        typingTimers.delete(key);
      }
      socket.to(`room:${roomId}`).emit("stopTyping", { userId: uid, roomId });
    } catch {
      /* ignore */
    }
  });

  /**
   * Mark specific messages as seen (or last N) — client sends { roomId, messageIds?: string[] }
   */
  socket.on("seenMessage", async ({ roomId, messageIds }, cb) => {
    try {
      const room = await assertUserInRoom(uid, roomId);
      const filter = {
        chatRoomId: room._id,
        receiverId: new mongoose.Types.ObjectId(uid),
        isSeen: false,
      };
      if (Array.isArray(messageIds) && messageIds.length) {
        const ids = messageIds
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));
        if (ids.length) filter._id = { $in: ids };
      }
      await Message.updateMany(filter, {
        $set: {
          isSeen: true,
          deliveryStatus: "read",
          seenAt: new Date(),
        },
      });
      const partnerId = room.participants.find((p) => p.toString() !== uid);
      io.to(`user:${partnerId.toString()}`).emit("messagesSeen", {
        chatRoomId: roomId,
        byUserId: uid,
        messageIds: messageIds || [],
      });
      if (typeof cb === "function") cb({ ok: true });
    } catch (e) {
      if (typeof cb === "function") cb({ ok: false, message: e.message });
    }
  });

  socket.on("disconnect", () => {
    typingTimers.forEach((t, key) => {
      if (key.endsWith(`:${uid}`)) {
        clearTimeout(t);
        typingTimers.delete(key);
      }
    });
  });
}

function attachChatSocket(io) {
  io.on("connection", (socket) => {
    registerChatHandlers(io, socket);
  });
}

module.exports = { attachChatSocket };
