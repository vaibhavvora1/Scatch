const express = require("express");
const router = express.Router();
const Seller = require("../../models/seller-model");
const Product = require("../../models/product-model");
const User = require("../../models/user-model");
const isLoggedIn = require("../../middlewares/isLoggedin");
const { cache, clearCacheTags } = require("../../utils/api-cache");

// ─── Register as Seller ───────────────────────────────────
router.post("/register", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user already has a seller account
    const existingSeller = await Seller.findOne({ user: userId });
    if (existingSeller) {
      return res
        .status(400)
        .json({ message: "You already have a seller account" });
    }

    const {
      shopName,
      shopDescription,
      contactNumber,
      address,
      city,
      state,
      pincode,
    } = req.body;

    if (!shopName) {
      return res.status(400).json({ message: "Shop name is required" });
    }

    const seller = new Seller({
      user: userId,
      shopName,
      shopDescription: shopDescription || "",
      email: req.user.email,
      contactNumber: contactNumber || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      status: "pending", // Requires admin approval
    });

    await seller.save();
    clearCacheTags(["admin", "sellers"]);

    res.status(201).json({
      message: "Seller application submitted. Awaiting admin approval.",
      seller: seller.toJSON(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering as seller", error: error.message });
  }
});

// ─── Get My Seller Profile ────────────────────────────────
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id }).populate(
      "user",
      "fullname email",
    );

    if (!seller) {
      return res
        .status(404)
        .json({ message: "You are not registered as a seller" });
    }

    res.json(seller);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
});

// ─── Update Seller Profile ────────────────────────────────
router.put("/profile", isLoggedIn, async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });

    if (!seller) {
      return res.status(404).json({ message: "Seller account not found" });
    }

    if (seller.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Only approved sellers can update profile" });
    }

    const {
      shopDescription,
      contactNumber,
      address,
      city,
      state,
      pincode,
      shopLogo,
    } = req.body;

    if (shopDescription !== undefined) seller.shopDescription = shopDescription;
    if (contactNumber !== undefined) seller.contactNumber = contactNumber;
    if (address !== undefined) seller.address = address;
    if (city !== undefined) seller.city = city;
    if (state !== undefined) seller.state = state;
    if (pincode !== undefined) seller.pincode = pincode;
    if (shopLogo !== undefined) seller.shopLogo = shopLogo;

    await seller.save();
    clearCacheTags(["admin", "sellers"]);
    res.json({
      message: "Profile updated successfully",
      seller: seller.toJSON(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

// ─── Get Seller by ID (Public) ────────────────────────────
router.get("/my/products", isLoggedIn, async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });

    if (!seller) {
      return res
        .status(404)
        .json({ message: "You are not registered as a seller" });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ seller: seller._id })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Product.countDocuments({ seller: seller._id }),
    ]);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

router.get("/:sellerId", cache(60, ["sellers"]), async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.sellerId)
      .select(
        "shopName shopDescription shopLogo rating reviewCount totalSold isVerified status",
      )
      .populate("user", "fullname");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.status !== "approved") {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json(seller);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching seller", error: error.message });
  }
});

// ─── Get Seller Products ──────────────────────────────────
router.get("/:sellerId/products", cache(60, ["seller-products"]), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      category = "",
      badge = "",
    } = req.query;

    const seller = await Seller.findById(req.params.sellerId);
    if (!seller || seller.status !== "approved") {
      return res.status(404).json({ message: "Seller not found" });
    }

    const query = { seller: req.params.sellerId };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (badge && badge !== "all") {
      query.badge = badge;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("seller", "shopName shopLogo")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

// ─── Get My Products (Seller Only) ────────────────────────
module.exports = router;
