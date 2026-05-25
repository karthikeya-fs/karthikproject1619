const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const { uploadProfileImage } = require("../middleware/upload");

const {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  updateProfileImage,
  getPublicProfile,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Profile — JWT protected
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Profile image upload — JWT protected, multipart/form-data
router.put(
  "/profile/image",
  protect,
  (req, res, next) => {
    uploadProfileImage(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  updateProfileImage
);

// Public profile — view another user's profile (read-only)
router.get("/profile/:userId", protect, getPublicProfile);

module.exports = router;
