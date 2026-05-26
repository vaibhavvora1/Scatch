const mongoose = require("mongoose");

function normalizeLogo(logo) {
  if (!logo) return "";
  if (Buffer.isBuffer(logo)) {
    return `data:image/png;base64,${logo.toString("base64")}`;
  }
  if (typeof logo !== "string") return "";
  if (
    logo.startsWith("data:image/") ||
    logo.startsWith("http://") ||
    logo.startsWith("https://") ||
    logo.startsWith("/")
  ) {
    return logo;
  }
  return "";
}

const sellerSchema = new mongoose.Schema(
  {
    // User reference - unique seller account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },

    // Shop/Brand Information
    shopName: { type: String, required: true, trim: true },
    shopDescription: { type: String, default: "" },
    shopLogo: { type: String, default: "" }, // Base64 or path

    // Contact & Address
    email: { type: String, required: true, lowercase: true, trim: true },
    contactNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },

    // Seller Status
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected", "suspended"],
    },
    approvedAt: { type: Date, default: null },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },

    // Shop Analytics
    totalProducts: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // Verification
    isVerified: { type: Boolean, default: false },
    verificationDocs: { type: String, default: "" }, // Base64 or path to docs
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.shopLogo = normalizeLogo(ret.shopLogo);
        return ret;
      },
    },
  },
);

// Indexes for quick seller lookups
sellerSchema.index({ status: 1 });
sellerSchema.index({ shopName: 1 });

module.exports = mongoose.model("Seller", sellerSchema);
