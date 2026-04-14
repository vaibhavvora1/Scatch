const mongoose = require("mongoose");

const userschema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,

    min: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // ✅ exact model name
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],

  orders: {
    typeof: Array,
    default: [],
  },
  contactnumber: Number,
  picture: String,
});

module.exports = mongoose.model("users", userschema);
