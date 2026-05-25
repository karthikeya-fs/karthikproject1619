const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createRoom,
  getRoom,
  getMessages,
  sendMessageHttp,
  getMyChatRooms,
  markRoomRead,
} = require("../controllers/chatController");

/** List rooms before the dynamic :roomId route */
router.get("/my-rooms", protect, getMyChatRooms);

router.post("/create-room", protect, createRoom);

router.get("/messages/:roomId", protect, getMessages);

router.post("/send", protect, sendMessageHttp);

router.post("/mark-read/:roomId", protect, markRoomRead);

router.get("/:roomId", protect, getRoom);

module.exports = router;
