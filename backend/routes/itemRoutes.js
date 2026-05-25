const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const { upload } = require("../middleware/upload");
const {
  createItem,
  reportLostItem,
  getAllItems,
  getLostItems,
  getSingleItem,
  searchItems,
  deleteItem,
} = require("../controllers/itemController");

router.get("/search", searchItems);          // GET /api/items/search
router.post("/create", protect, upload.single("image"), createItem);
router.post("/report-lost", protect, upload.single("image"), reportLostItem);
router.get("/all", getAllItems);
router.get("/lost", getLostItems);
router.get("/:id", getSingleItem);
router.delete("/:id", protect, deleteItem);  // DELETE /api/items/:id

module.exports = router;
