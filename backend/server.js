const path = require("path");
const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");

// Must be first — before any other require() reads process.env
dotenv.config();

console.log("SMTP_USER set:", !!process.env.SMTP_USER);
console.log("SMTP_PASS set:", !!process.env.SMTP_PASS);

const connectDB = require("./config/db");
const { socketAuthMiddleware } = require("./socket/socketAuth");
const { attachChatSocket } = require("./socket/chatSocket");
const { seedDefaults } = require("./utils/seedDefaults");

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
  // Production Vercel frontend — set FRONTEND_URL in Render env vars
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
// === Health check (no auth required) ===
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", port: PORT, uptime: process.uptime() });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Serve public folder so logo.png is reachable at /logo.png for email embedding
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/claims", require("./routes/claimRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/metadata", require("./routes/metadataRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Global error handler — catches unhandled async errors
app.use((err, _req, res, _next) => {
  // Mongoose CastError: invalid ObjectId passed to findById / findOne
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ message: `Duplicate value for ${field}` });
  }

  console.error("Unhandled error:", err.message || err);
  if (err.stack) console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const startServer = async () => {
  try {
    await connectDB();
    await seedDefaults();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.use(socketAuthMiddleware);
    attachChatSocket(io);
    app.set("io", io);

    const PORT = Number(process.env.PORT) || 5000;

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Auth API: http://127.0.0.1:${PORT}/api/auth`);
      console.log(`Chat API: http://127.0.0.1:${PORT}/api/chat`);
      console.log(`Socket.io ready (JWT on connect)`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
