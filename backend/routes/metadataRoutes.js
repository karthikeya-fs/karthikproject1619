const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const {
  getCategories,
  getBuildings,
  createCategory,
  updateCategory,
  deleteCategory,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} = require("../controllers/metadataController");

router.get("/categories", getCategories);
router.get("/buildings", getBuildings);

router.post("/categories", protect, requireAdmin, createCategory);
router.put("/categories/:id", protect, requireAdmin, updateCategory);
router.delete("/categories/:id", protect, requireAdmin, deleteCategory);

router.post("/buildings", protect, requireAdmin, createBuilding);
router.put("/buildings/:id", protect, requireAdmin, updateBuilding);
router.delete("/buildings/:id", protect, requireAdmin, deleteBuilding);

module.exports = router;
