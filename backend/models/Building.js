const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mapX: { type: Number, default: 50 },
    mapY: { type: Number, default: 50 },
    mapWidth: { type: Number, default: 20 },
    mapHeight: { type: Number, default: 18 },
    mapType: {
      type: String,
      default: "building",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Building", buildingSchema);
