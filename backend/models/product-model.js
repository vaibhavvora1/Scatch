const mongoose = require("mongoose");

function normalizeProductImage(image) {
  if (!image) return "";
  if (Buffer.isBuffer(image)) {
    return `data:image/png;base64,${image.toString("base64")}`;
  }
  if (typeof image !== "string") return "";
  if (
    image.startsWith("data:image/") ||
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }
  return "";
}

const productSchema = new mongoose.Schema(
  {
    // Seller reference for seller-created products; admin products can be null.
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      default: null,
    },

    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },

    // Visual theming
    bgcolor: { type: String, default: "#ffffff" },
    panelcolor: { type: String, default: "#000000" },
    textcolor: { type: String, default: "#ffffff" },

    // Image stored as base64 string for easy API serving
    image: { type: String, default: "" },

    // Category and badge
    category: {
      type: String,
      default: "general",
      set: (value) => (typeof value === "string" ? value.toLowerCase() : value),
      enum: [
        "general",
        "clothing",
        "footwear",
        "accessories",
        "electronics",
        "home",
        "beauty",
      ],
    },
    badge: {
      type: String,
      default: "none",
      set: (value) => (typeof value === "string" ? value.toLowerCase() : value),
      enum: ["none", "trending", "featured", "new-arrival", "best-seller"],
    },

    // Analytics
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.image = normalizeProductImage(ret.image);
        return ret;
      },
    },
  },
);

productSchema.pre("validate", function normalizeLegacyValues(next) {
  if (typeof this.category === "string")
    this.category = this.category.toLowerCase();
  if (typeof this.badge === "string") this.badge = this.badge.toLowerCase();
});

// Index for fast queries
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ badge: 1 });

module.exports = mongoose.model("Product", productSchema);
