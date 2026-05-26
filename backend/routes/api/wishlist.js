const express    = require("express");
const router     = express.Router();
const userModel  = require("../../models/user-model");
const isLoggedIn = require("../../middlewares/isLoggedin");

router.use(isLoggedIn);

// POST /api/wishlist/toggle/:productId
router.post("/toggle/:productId", async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const idx  = user.wishlist.findIndex((id) => id.toString() === req.params.productId);

    let message;
    if (idx === -1) {
      user.wishlist.push(req.params.productId);
      message = "Added to wishlist";
    } else {
      user.wishlist.splice(idx, 1);
      message = "Removed from wishlist";
    }

    await user.save();
    return res.json({ success: true, message, wishlist: user.wishlist });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/wishlist
router.get("/", async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate("wishlist");
    return res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
