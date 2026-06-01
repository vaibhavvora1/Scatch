const express = require("express");
const router = express.Router();
const productModel = require("../../models/product-model");
const userModel = require("../../models/user-model");
const isOwner = require("../../middlewares/isowner");
const { cache, clearCacheTags } = require("../../utils/api-cache");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

router.use(isOwner);

// ─────────────────────────────────────────────────────
//  DASHBOARD STATS  GET /api/admin/stats
// ─────────────────────────────────────────────────────
router.get("/stats", cache(30, ["admin"]), async (req, res) => {
  try {
    const totalProducts = await productModel.countDocuments();
    const totalUsers = await userModel.countDocuments();

    // Aggregate total revenue and total orders
    const orderAgg = await userModel.aggregate([
      { $unwind: "$orders" },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$orders.totalAmount" },
        },
      },
    ]);

    const { totalOrders = 0, totalRevenue = 0 } = orderAgg[0] || {};

    // Top 5 best-selling products
    const topProducts = await productModel
      .find()
      .sort({ totalSold: -1 })
      .limit(5)
      .select("name totalSold price badge image");

    // Trending (most viewed)
    const trending = await productModel
      .find()
      .sort({ views: -1 })
      .limit(5)
      .select("name views price badge image");

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await userModel.aggregate([
      { $unwind: "$orders" },
      { $match: { "orders.createdAt": { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$orders.createdAt" },
            month: { $month: "$orders.createdAt" },
          },
          revenue: { $sum: "$orders.totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return res.json({
      success: true,
      stats: { totalProducts, totalUsers, totalOrders, totalRevenue },
      topProducts,
      trending,
      monthlyRevenue,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────
//  PRODUCT MANAGEMENT
// ─────────────────────────────────────────────────────

// GET /api/admin/products
router.get("/products", cache(60, ["admin", "products"]), async (req, res) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1 });
    return res.json({ success: true, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/admin/products/create
router.post("/products/create", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      category,
      badge,
      description,
      stock,
    } = req.body;

    if (!name || !price) {
      return res
        .status(400)
        .json({ success: false, message: "Name and price are required" });
    }

    let imageBase64 = "";
    if (req.file) {
      imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const product = await productModel.create({
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      category,
      badge,
      description,
      stock,
      image: imageBase64,
    });
    clearCacheTags(["admin", "products", "seller-products"]);

    return res
      .status(201)
      .json({ success: true, message: "Product created", product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/admin/products/:id
router.patch("/products/:id", upload.single("image"), async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      updates.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const product = await productModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true },
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    clearCacheTags(["admin", "products", "seller-products"]);

    return res.json({ success: true, message: "Product updated", product });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/admin/products/:id
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    clearCacheTags(["admin", "products", "seller-products"]);
    return res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────
//  USER MANAGEMENT
// ─────────────────────────────────────────────────────

// GET /api/admin/users
router.get("/users", cache(30, ["admin", "users"]), async (req, res) => {
  try {
    const users = await userModel
      .find()
      .select("-password")
      .populate("orders.products.product")
      .sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────
//  ORDER MANAGEMENT
// ─────────────────────────────────────────────────────

// GET /api/admin/orders
router.get("/orders", cache(20, ["admin", "orders"]), async (req, res) => {
  try {
    const usersWithOrders = await userModel
      .find({ "orders.0": { $exists: true } })
      .select("fullname email orders")
      .populate("orders.products.product");

    // Flatten into order list with user info
    const orders = [];
    for (const user of usersWithOrders) {
      for (const order of user.orders) {
        orders.push({
          orderId: order._id,
          user: { id: user._id, name: user.fullname, email: user.email },
          products: order.products,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          address: order.address,
        });
      }
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/admin/orders/:userId/:orderId/status
router.patch("/orders/:userId/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const user = await userModel.findById(req.params.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const order = user.orders.id(req.params.orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.status = status;
    await user.save();
    clearCacheTags(["admin", "orders"]);

    return res.json({ success: true, message: "Order status updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────
//  SELLER MANAGEMENT
// ─────────────────────────────────────────────────────

// GET all pending seller applications
router.get("/sellers/pending", cache(30, ["admin", "sellers"]), async (req, res) => {
  try {
    const Seller = require("../../models/seller-model");
    const sellers = await Seller.find({ status: "pending" })
      .populate("user", "fullname email contactnumber")
      .sort({ createdAt: -1 });

    res.json(sellers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sellers", error: error.message });
  }
});

// GET all sellers (all statuses)
router.get("/sellers", cache(30, ["admin", "sellers"]), async (req, res) => {
  try {
    const Seller = require("../../models/seller-model");
    const { status = "", page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [sellers, total] = await Promise.all([
      Seller.find(query)
        .populate("user", "fullname email")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Seller.countDocuments(query),
    ]);

    res.json({ sellers, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sellers", error: error.message });
  }
});

// PATCH - Approve seller
router.patch("/sellers/:sellerId/approve", async (req, res) => {
  try {
    const Seller = require("../../models/seller-model");
    const seller = await Seller.findById(req.params.sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.status = "approved";
    seller.isVerified = true;
    seller.approvedAt = new Date();
    seller.approvedBy = req.owner.id;

    await seller.save();
    clearCacheTags(["admin", "sellers", "seller-products", "products"]);

    res.json({ message: "Seller approved successfully", seller });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving seller", error: error.message });
  }
});

// PATCH - Reject seller
router.patch("/sellers/:sellerId/reject", async (req, res) => {
  try {
    const Seller = require("../../models/seller-model");
    const seller = await Seller.findById(req.params.sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.status = "rejected";
    await seller.save();
    clearCacheTags(["admin", "sellers", "seller-products", "products"]);

    res.json({ message: "Seller application rejected", seller });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting seller", error: error.message });
  }
});

// PATCH - Suspend seller
router.patch("/sellers/:sellerId/suspend", async (req, res) => {
  try {
    const Seller = require("../../models/seller-model");
    const seller = await Seller.findById(req.params.sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.status = "suspended";
    await seller.save();
    clearCacheTags(["admin", "sellers", "seller-products", "products"]);

    res.json({ message: "Seller suspended", seller });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error suspending seller", error: error.message });
  }
});

// GET seller details and their products
router.get("/sellers/:sellerId/details", cache(30, ["admin", "sellers", "seller-products"]), async (req, res) => {
  try {
    const Seller = require("../../models/seller-model");
    const seller = await Seller.findById(req.params.sellerId).populate(
      "user",
      "fullname email contactnumber",
    );

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const products = await productModel.find({ seller: req.params.sellerId });

    res.json({
      seller,
      productCount: products.length,
      totalSold: seller.totalSold,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching seller details", error: error.message });
  }
});

module.exports = router;
