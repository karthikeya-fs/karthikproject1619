const Category = require("../models/Category");
const Building = require("../models/Building");

const getCategories = async (req, res) => {
  try {
    const query = req.userRole === "admin" ? {} : { isActive: true };
    const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBuildings = async (req, res) => {
  try {
    const query = req.userRole === "admin" ? {} : { isActive: true };
    const buildings = await Building.find(query).sort({ sortOrder: 1, name: 1 });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, label, iconKey, blurByDefault, sortOrder } = req.body;
    if (!name || !label) {
      return res.status(400).json({ message: "name and label are required" });
    }
    const category = await Category.create({
      name: String(name).trim(),
      label: String(label).trim(),
      iconKey: iconKey || "box",
      blurByDefault: !!blurByDefault,
      sortOrder: Number(sortOrder) || 0,
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deactivated", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBuilding = async (req, res) => {
  try {
    const { name, mapX, mapY, mapWidth, mapHeight, mapType, sortOrder } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const building = await Building.create({
      name: String(name).trim(),
      mapX: Number(mapX) ?? 50,
      mapY: Number(mapY) ?? 50,
      mapWidth: Number(mapWidth) ?? 20,
      mapHeight: Number(mapHeight) ?? 18,
      mapType: mapType || "building",
      sortOrder: Number(sortOrder) || 0,
    });
    res.status(201).json(building);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Building already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateBuilding = async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }
    res.json(building);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBuilding = async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }
    res.json({ message: "Building deactivated", building });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getBuildings,
  createCategory,
  updateCategory,
  deleteCategory,
  createBuilding,
  updateBuilding,
  deleteBuilding,
};
