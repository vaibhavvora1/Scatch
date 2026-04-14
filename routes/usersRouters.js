// express setup
const express = require("express");
const Joi = require("joi"); //for validation
const {
  registeruser,
  loginuser,
  logoutuser,
} = require("../controllers/authcontroller"); //for register route
//routers setup
const routers = express.Router();

//routers for users
routers.post("/register", registeruser); //register route

//login router
routers.post("/login", loginuser);

//logout router
routers.get("/logout", logoutuser);

//cart route
const userModel = require("../models/user-model");
const isLoggedin = require("../middlewares/isLoggedin");
routers.get("/cart", isLoggedin, async function (req, res) {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product");

  res.render("cart", { user });
});
routers.post("/cart/remove/:productid", isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const item = user.cart.id(req.params.productid);

    if (!item) return res.redirect("/cart");

    if (item.quantity > 1) {
      item.quantity -= 1; // decrease
    } else {
      item.deleteOne(); // remove completely
    }

    await user.save();
    res.redirect("/users/cart");
  } catch (err) {
    console.log(err);
    res.send("Error removing item");
  }
});
routers.post("/cart/update/:id", isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });

    const item = user.cart.id(req.params.id);

    if (!item) return res.redirect("/cart");

    item.quantity += 1;

    await user.save();
    res.redirect("/users/cart");
  } catch (err) {
    console.log(err);
    res.send("Error updating item");
  }
});

//exports routes

module.exports = routers;
