const User = require("../models/User");
const Otp = require("../models/otp");
const Item = require("../models/Item");
const path = require("path");
const fs = require("fs");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateOTP = require("../utils/generateOtp");
const sendOTPEmail = require("../config/email");

const matchEmailCI = (lowerEmail) => ({
  $expr: { $eq: [{ $toLower: "$email" }, lowerEmail] },
});


// ================= REGISTER USER =================

const registerUser = async (req, res) => {
  try {
    console.log("Registration request body:", req.body);

    const name =
      typeof req.body.name === "string" ? req.body.name.trim() : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";
    const department =
      typeof req.body.department === "string" ? req.body.department.trim() : "";
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    const verifiedOtp = await Otp.findOne({ email, purpose: "registration", used: true });
    if (!verifiedOtp) {
      return res.status(400).json({
        message: "Email not verified. Please complete OTP verification first.",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      await Otp.deleteMany({ email, purpose: "registration" });
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      isVerified: true,
    });

    await Otp.deleteMany({ email, purpose: "registration" });

    console.log("User registered successfully:", email);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("registerUser error:", error);

    if (error.code === 11000) {
      const dupEmail = error?.keyValue?.email;
      if (dupEmail) await Otp.deleteMany({ email: dupEmail, purpose: "registration" });
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};


// ================= LOGIN USER =================

const loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne(matchEmailCI(email));

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: user.bannedReason || "Your account has been suspended",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= SEND OTP =================

const sendOTP = async (req, res) => {
  try {
    console.log("sendOTP request body:", req.body);

    const email =
      typeof req.body.email === "string" ? req.body.email.trim() : req.body.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailKey = email.trim().toLowerCase();

    const userExists = await User.findOne(matchEmailCI(emailKey));
    if (userExists) {
      return res.status(400).json({
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Rate-limit: one OTP per email per 60 seconds
    const recentOtp = await Otp.findOne({ email: emailKey, purpose: "registration", used: false });
    if (recentOtp) {
      const ageMs = Date.now() - new Date(recentOtp._id.getTimestamp()).getTime();
      if (ageMs < 60_000) {
        return res.status(429).json({
          message: "Please wait 1 minute before requesting another OTP.",
        });
      }
      await Otp.deleteMany({ email: emailKey, purpose: "registration" });
    }

    const otp = String(generateOTP());

    // Store plaintext OTP — expires in 5 minutes, single-use
    const otpRecord = await Otp.create({
      email: emailKey,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      purpose: "registration",
    });

    try {
      await sendOTPEmail(emailKey, otp);
      console.log("✅ OTP sent successfully to", emailKey);
      return res.status(200).json({ message: "OTP sent to your email" });
    } catch (mailErr) {
      console.error("=== OTP EMAIL ERROR ===");
      console.error("Message :", mailErr.message);
      console.error("Code    :", mailErr.code ?? "none");
      console.error("Stack   :", mailErr.stack);
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
        debug: mailErr.message,
      });
    }

  } catch (error) {
    console.error("sendOTP error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ================= VERIFY OTP =================

const verifyOTP = async (req, res) => {
  try {
    console.log("verifyOTP request body:", { email: req.body.email, otp: req.body.otp ? "***" : undefined });

    const email =
      typeof req.body.email === "string" ? req.body.email.trim() : req.body.email;
    const { otp } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const emailKey = email.trim().toLowerCase();
    const otpStr = String(otp).trim();

    if (otpStr.length !== 6 || isNaN(otpStr)) {
      return res.status(400).json({ message: "OTP must be a 6-digit number" });
    }

    const existingOTP = await Otp.findOne({ email: emailKey, purpose: "registration", used: false });

    if (!existingOTP) {
      return res.status(400).json({ message: "OTP not found. Please request a new one." });
    }

    if (existingOTP.expiresAt < new Date()) {
      await Otp.deleteMany({ email: emailKey, purpose: "registration" });
      return res.status(400).json({ message: "OTP expired. Please request a new code." });
    }

    // Direct plaintext comparison — no hashing
    if (existingOTP.code !== otpStr) {
      return res.status(400).json({ message: "Invalid OTP. Please check and try again." });
    }

    await Otp.updateOne(
      { _id: existingOTP._id },
      { $set: { used: true, verifiedAt: new Date() } }
    );

    res.status(200).json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("verifyOTP error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ================= GET PUBLIC PROFILE =================

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("name profileImage department rollNumber phone github linkedin isVerified createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });

    let postCount = 0;
    try {
      postCount = await Item.countDocuments({ postedBy: req.params.userId, isRemoved: { $ne: true } });
    } catch {}

    res.json({ success: true, user: { ...user.toJSON(), postCount } });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ message: "Invalid user ID" });
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};


// ================= EXPORTS =================

// ================= GET PROFILE =================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Graceful post count — don't fail the profile if the Item query errors out
    let postCount = 0;
    try {
      postCount = await Item.countDocuments({
        postedBy: req.user,
        isRemoved: { $ne: true },
      });
    } catch (countErr) {
      console.warn("postCount query failed (non-fatal):", countErr.message);
    }

    res.json({ ...user.toJSON(), postCount });
  } catch (error) {
    console.error("getProfile error:", error);

    // Differentiate error types for better frontend UX
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    if (error.name === "MongooseError" || error.name === "MongoNetworkError") {
      return res.status(503).json({ message: "Unable to connect to profile service." });
    }

    res.status(500).json({ message: "Failed to load profile" });
  }
};


// ================= UPDATE PROFILE =================

const updateProfile = async (req, res) => {
  try {
    // Only allow safe fields — never let the client change email, password, or role here
    const { name, rollNumber, department, phone, github, linkedin } = req.body;

    const updates = {};
    if (name      !== undefined) updates.name       = String(name).trim();
    if (rollNumber !== undefined) updates.rollNumber = String(rollNumber).trim();
    if (department !== undefined) updates.department = String(department).trim();
    if (phone      !== undefined) updates.phone      = String(phone).trim();
    if (github     !== undefined) updates.github     = String(github).trim();
    if (linkedin   !== undefined) updates.linkedin   = String(linkedin).trim();

    const user = await User.findByIdAndUpdate(
      req.user,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postCount = await Item.countDocuments({
      postedBy: req.user,
      isRemoved: { $ne: true },
    });

    console.log("Profile updated for:", user.email, updates);

    res.json({ ...user.toJSON(), postCount });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};


// ================= UPDATE PROFILE IMAGE =================

const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    // Delete old profile image from disk if one exists
    const existing = await User.findById(req.user).select("profileImage");
    if (existing?.profileImage && existing.profileImage.startsWith("/uploads/")) {
      const oldPath = path.join(__dirname, "..", existing.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log("Old profile image deleted:", oldPath);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Profile image updated in DB:", imageUrl);

    return res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: imageUrl,
    });
  } catch (error) {
    console.error("updateProfileImage error:", error.message);
    return res.status(500).json({ message: "Failed to update profile image" });
  }
};


module.exports = {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  updateProfileImage,
  getPublicProfile,
};