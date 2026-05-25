const Category = require("../models/Category");
const Building = require("../models/Building");
const User = require("../models/User");

const DEFAULT_CATEGORIES = [
  { name: "Electronics", label: "Electronics", iconKey: "cpu", blurByDefault: false, sortOrder: 1 },
  { name: "IDs", label: "IDs / Documents", iconKey: "credit-card", blurByDefault: true, sortOrder: 2 },
  { name: "Clothing", label: "Clothing", iconKey: "tag", blurByDefault: false, sortOrder: 3 },
  { name: "Other", label: "Other / Misc", iconKey: "box", blurByDefault: false, sortOrder: 4 },
];

const DEFAULT_BUILDINGS = [
  { name: "Science Block A", mapX: 15, mapY: 20, mapWidth: 22, mapHeight: 18, mapType: "building", sortOrder: 1 },
  { name: "Administration Building", mapX: 42, mapY: 15, mapWidth: 16, mapHeight: 20, mapType: "building", sortOrder: 2 },
  { name: "Engineering Block B", mapX: 63, mapY: 20, mapWidth: 22, mapHeight: 18, mapType: "building", sortOrder: 3 },
  { name: "Main Library", mapX: 12, mapY: 48, mapWidth: 20, mapHeight: 20, mapType: "library", sortOrder: 4 },
  { name: "Central Cafeteria", mapX: 38, mapY: 45, mapWidth: 24, mapHeight: 22, mapType: "food", sortOrder: 5 },
  { name: "Student Center", mapX: 68, mapY: 48, mapWidth: 20, mapHeight: 20, mapType: "building", sortOrder: 6 },
  { name: "Campus Auditorium", mapX: 15, mapY: 78, mapWidth: 22, mapHeight: 18, mapType: "auditorium", sortOrder: 7 },
  { name: "Main Lawn & Grounds", mapX: 42, mapY: 75, mapWidth: 16, mapHeight: 20, mapType: "grounds", sortOrder: 8 },
  { name: "Sports Complex", mapX: 63, mapY: 78, mapWidth: 22, mapHeight: 18, mapType: "sports", sortOrder: 9 },
];

async function seedDefaults() {
  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
    console.log("✅ Seeded default item categories");
  }

  const buildingCount = await Building.countDocuments();
  if (buildingCount === 0) {
    await Building.insertMany(DEFAULT_BUILDINGS);
    console.log("✅ Seeded default campus buildings");
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail) {
    const promoted = await User.findOneAndUpdate(
      { email: adminEmail },
      { role: "admin" },
      { new: true }
    );
    if (promoted) {
      console.log(`✅ Promoted ${adminEmail} to admin`);
    }
  }
}

module.exports = { seedDefaults, DEFAULT_CATEGORIES, DEFAULT_BUILDINGS };
