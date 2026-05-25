const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const {
  getDashboard,
  getUsers,
  banUser,
  unbanUser,
  getModerationItems,
  removeItem,
  restoreItem,
  getAllClaimsAdmin,
  getActivitySummary,
} = require("../controllers/adminController");

router.use(protect, requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/activity", getActivitySummary);
router.get("/users", getUsers);
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);
router.get("/items", getModerationItems);
router.delete("/items/:id", removeItem);
router.patch("/items/:id/restore", restoreItem);
router.get("/claims", getAllClaimsAdmin);

module.exports = router;
