const express    = require("express");
const router     = express.Router();
const userModel  = require("../../models/user-model");
const isLoggedIn = require("../../middlewares/isLoggedin");

// All cart routes require auth
router.use(isLoggedIn);

// GET /api/cart  — get user's populated cart
router.get("/", async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate("cart.product");
    return res.json({ success: true, cart: user.cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/cart/add/:productId
router.post("/add/:productId", async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const existing = user.cart.find(
      (item) => item.product && item.product.toString() === req.params.productId
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      user.cart.push({ product: req.params.productId, quantity: 1 });
    }

    await user.save();
    const updated = await userModel.findById(req.user._id).populate("cart.product");
    return res.json({ success: true, message: "Added to cart", cart: updated.cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/cart/update/:itemId  — increase or decrease quantity
router.patch("/update/:itemId", async (req, res) => {
  try {
    const { action } = req.body; // "increase" | "decrease"
    const user = await userModel.findById(req.user._id);
    const item = user.cart.id(req.params.itemId);

    if (!item) return res.status(404).json({ success: false, message: "Cart item not found" });

    if (action === "increase") {
      item.quantity += 1;
    } else if (action === "decrease") {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        item.deleteOne();
      }
    }

    await user.save();
    const updated = await userModel.findById(req.user._id).populate("cart.product");
    return res.json({ success: true, cart: updated.cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/cart/remove/:itemId
router.delete("/remove/:itemId", async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const item = user.cart.id(req.params.itemId);

    if (!item) return res.status(404).json({ success: false, message: "Cart item not found" });

    item.deleteOne();
    await user.save();
    const updated = await userModel.findById(req.user._id).populate("cart.product");
    return res.json({ success: true, message: "Item removed", cart: updated.cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/cart/clear
router.delete("/clear", async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
    return res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
