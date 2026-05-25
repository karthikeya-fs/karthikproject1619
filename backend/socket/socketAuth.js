const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Socket.io handshake JWT (auth.token or Authorization header).
 */
async function socketAuthMiddleware(socket, next) {
  try {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      "";

    if (typeof token === "string" && token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    if (!token) {
      return next(new Error("Unauthorized: missing token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name email department");
    if (!user) {
      return next(new Error("Unauthorized: user not found"));
    }

    socket.userId = user._id.toString();
    socket.userName = user.name;
    next();
  } catch (err) {
    next(new Error("Unauthorized: invalid token"));
  }
}

module.exports = { socketAuthMiddleware };
