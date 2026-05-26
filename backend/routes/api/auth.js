const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const userModel = require("../../models/user-model");
const ownerModel = require("../../models/owner-model");
const generateToken = require("../../utils/gettoken");
const crypto = require("crypto");
const { clearCacheTags } = require("../../utils/api-cache");

// ─────────────────────────────────────────────────────
//  USER AUTH
// ─────────────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    let { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    email = email.trim().toLowerCase();

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ fullname, email, password: hash });
    clearCacheTags(["admin", "users"]);

    const token = generateToken(user, "user");

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    email = email.trim().toLowerCase();
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user, "user");

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────
//  OWNER AUTH
// ─────────────────────────────────────────────────────

// POST /api/auth/admin/register  (dev only)
if (process.env.NODE_ENV !== "production") {
  router.post("/admin/register", async (req, res) => {
    try {
      const { fullname, email, password } = req.body;

      if (!fullname || !email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      const existing = await ownerModel.findOne();
      if (existing) {
        return res
          .status(403)
          .json({ success: false, message: "Owner already exists" });
      }

      const hash = await bcrypt.hash(password, 10);
      await ownerModel.create({ fullname, email, password: hash });
      clearCacheTags(["admin"]);

      return res
        .status(201)
        .json({ success: true, message: "Admin created. Please login." });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
}

// POST /api/auth/admin/login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const owner = await ownerModel.findOne({ email });
    if (!owner) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    // Rotate session ID
    const ownerSessionId = crypto.randomBytes(24).toString("hex");
    owner.activeSessionId = ownerSessionId;
    await owner.save();

    const token = generateToken(owner, "owner", { ownerSessionId });

    return res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { id: owner._id, fullname: owner.fullname, email: owner.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/auth/admin/logout
router.post("/admin/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_KEY);
      const owner = await ownerModel.findById(decoded.id);
      if (owner) {
        owner.activeSessionId = null;
        await owner.save();
      }
    }
  } catch (_) {}
  return res.json({ success: true, message: "Admin logged out" });
});

module.exports = router;
