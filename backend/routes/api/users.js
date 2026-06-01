const express    = require("express");
const router     = express.Router();
const userModel  = require("../../models/user-model");
const isLoggedIn = require("../../middlewares/isLoggedin");
const multer     = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});
const { clearCacheTags } = require("../../utils/api-cache");

router.use(isLoggedIn);

// GET /api/users/profile
router.get("/profile", async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("-password")
      .populate("orders.products.product")
      .populate("wishlist");
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/users/profile  — update name, contact
router.patch("/profile", async (req, res) => {
  try {
    const { fullname, contactnumber } = req.body;
    const updates = {};
    if (fullname)       updates.fullname       = fullname;
    if (contactnumber)  updates.contactnumber  = contactnumber;

    const user = await userModel
      .findByIdAndUpdate(req.user._id, updates, { new: true })
      .select("-password");
    clearCacheTags(["admin", "users"]);

    return res.json({ success: true, message: "Profile updated", user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/users/profile/picture  — upload profile picture
router.post("/profile/picture", upload.single("picture"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const user   = await userModel
      .findByIdAndUpdate(req.user._id, { picture: base64 }, { new: true })
      .select("-password");
    clearCacheTags(["admin", "users"]);

    return res.json({ success: true, message: "Picture updated", picture: user.picture });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
