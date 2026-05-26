const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true, minlength: 3 },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    contactnumber: { type: String, default: "" },

    // Base64 or path to profile picture
    picture: { type: String, default: "" },

    cart: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    orders: [
      {
        products: [
          {
            product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            quantity: { type: Number, default: 1 },
            price:    { type: Number, default: 0 },
          },
        ],
        totalAmount: { type: Number, default: 0 },
        status:      { type: String, default: "pending", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
        createdAt:   { type: Date, default: Date.now },
        address:     { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
