const express = require("express");
const router = express.Router();
const productModel = require("../../models/product-model");
const Seller = require("../../models/seller-model");
const isLoggedIn = require("../../middlewares/isLoggedin");
const { cache, clearCacheTags } = require("../../utils/api-cache");

// ─────────────────────────────────────────────────────
//  GET /api/products  — list with filtering/search/pagination
// ─────────────────────────────────────────────────────
router.get("/", cache(60, ["products"]), async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      badge = "",
      minPrice = 0,
      maxPrice = 9999999,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (badge) query.badge = badge;
    query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };

    const sortObj = { [sort]: order === "asc" ? 1 : -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await productModel.countDocuments(query);
    const products = await productModel
      .find(query)
      .populate("seller", "shopName shopLogo rating")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .populate(
        "seller",
        "shopName shopLogo shopDescription rating reviewCount totalSold",
      );

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Increment view count
    product.views = (product.views || 0) + 1;
    await product.save();

    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────
//  SELLER ENDPOINTS — Create/Update/Delete Products
// ─────────────────────────────────────────────────────

// POST /api/products — Create product (seller only)
router.post("/", isLoggedIn, async (req, res) => {
  try {
    // Check if user is an approved seller
    const seller = await Seller.findOne({ user: req.user.id });

    if (!seller) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not registered as a seller",
        });
    }

    if (seller.status !== "approved") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Your seller account is not approved yet",
        });
    }

    const {
      name,
      description,
      price,
      discount,
      stock,
      category,
      badge,
      image,
      bgcolor,
      panelcolor,
      textcolor,
    } = req.body;

    if (!name || !price) {
      return res
        .status(400)
        .json({ success: false, message: "Name and price are required" });
    }

    const product = new productModel({
      seller: seller._id,
      name,
      description: description || "",
      price: Number(price),
      discount: Number(discount) || 0,
      stock: Number(stock) || 1,
      category: category || "general",
      badge: badge || "none",
      image: image || "",
      bgcolor: bgcolor || "#ffffff",
      panelcolor: panelcolor || "#000000",
      textcolor: textcolor || "#ffffff",
    });

    await product.save();

    // Update seller's product count
    seller.totalProducts += 1;
    await seller.save();
    clearCacheTags(["products", "admin", "seller-products"]);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: await product.populate("seller", "shopName shopLogo"),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/products/:id — Update product (seller only)
router.put("/:id", isLoggedIn, async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if user is the seller
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller || !seller._id.equals(product.seller)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const {
      name,
      description,
      price,
      discount,
      stock,
      category,
      badge,
      image,
      bgcolor,
      panelcolor,
      textcolor,
    } = req.body;

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = Number(price);
    if (discount !== undefined) product.discount = Number(discount);
    if (stock !== undefined) product.stock = Number(stock);
    if (category) product.category = category;
    if (badge) product.badge = badge;
    if (image) product.image = image;
    if (bgcolor) product.bgcolor = bgcolor;
    if (panelcolor) product.panelcolor = panelcolor;
    if (textcolor) product.textcolor = textcolor;

    await product.save();
    clearCacheTags(["products", "admin", "seller-products"]);

    return res.json({
      success: true,
      message: "Product updated successfully",
      product: await product.populate("seller", "shopName shopLogo"),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/products/:id — Delete product (seller only)
router.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if user is the seller
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller || !seller._id.equals(product.seller)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await productModel.findByIdAndDelete(req.params.id);

    // Update seller's product count
    seller.totalProducts = Math.max(0, seller.totalProducts - 1);
    await seller.save();
    clearCacheTags(["products", "admin", "seller-products"]);

    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
