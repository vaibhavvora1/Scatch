const express       = require("express");
const router        = express.Router();
const userModel     = require("../../models/user-model");
const productModel  = require("../../models/product-model");
const isLoggedIn    = require("../../middlewares/isLoggedin");
const { clearCacheTags } = require("../../utils/api-cache");

router.use(isLoggedIn);

// POST /api/orders/checkout — place order from cart
router.post("/checkout", async (req, res) => {
  try {
    const { address = "" } = req.body;

    const user = await userModel.findById(req.user._id).populate("cart.product");

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Calculate total and build order items
    let totalAmount = 0;
    const orderProducts = user.cart
      .filter((item) => item.product) // skip orphaned refs
      .map((item) => {
        const discounted = item.product.price - (item.product.price * item.product.discount) / 100;
        totalAmount += discounted * item.quantity;

        return {
          product:  item.product._id,
          quantity: item.quantity,
          price:    discounted,
        };
      });

    if (orderProducts.length === 0) {
      return res.status(400).json({ success: false, message: "No valid products in cart" });
    }

    // Update totalSold for each product
    for (const item of user.cart) {
      if (item.product) {
        await productModel.findByIdAndUpdate(item.product._id, {
          $inc: { totalSold: item.quantity },
        });
      }
    }

    // Push new order and clear cart
    user.orders.push({ products: orderProducts, totalAmount, address, status: "pending" });
    user.cart = [];
    await user.save();
    clearCacheTags(["admin", "orders", "products"]);

    return res.json({ success: true, message: "Order placed successfully!", totalAmount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/orders/my — user's order history
router.get("/my", async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .populate("orders.products.product");

    return res.json({ success: true, orders: user.orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
