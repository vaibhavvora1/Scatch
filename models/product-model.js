const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    default: 0,
  },

  discount: {
    type: Number,
    default: 0,
  },

  bgcolor: String,
  panelcolor: String,
  textcolor: String,

  image: Buffer,
});

module.exports = mongoose.model("Product", productSchema);
