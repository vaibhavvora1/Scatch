const mongoose = require("mongoose");

const ownerschema = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      min: 3,
    },

    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    products: {
      type: Array,
      default: [],
    },
    gstin: String,
    picture: String,
    activeSessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("owner", ownerschema);
