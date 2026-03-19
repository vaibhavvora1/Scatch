const mongoose = require("mongoose");

const ownerschema = mongoose.Schema({
  fullname: String,
  email: String,
  password: String,

  products: {
    typeof: Array,
    default: [],
  },
  gstin: String,
  picture: String,
});

module.exports = mongoose.model("owner", ownerschema);
