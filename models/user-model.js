const mongoose = require("mongoose");

const userschema = mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  cart: {
    typeof: Array,
    default: [],
  },
  isadmin: Boolean,
  orders: {
    typeof: Array,
    default: [],
  },
  contactnumber: Number,
  picture: String,
});

module.exports = mongoose.model("users", userschema);
