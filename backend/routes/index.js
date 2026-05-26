const express = require("express");
const routers = express.Router();
const jwt = require("jsonwebtoken");
const isLoggedin = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const ownerModel = require("../models/owner-model");
const e = require("connect-flash");

/* GET home page. */
routers.get("/", async function (req, res) {
  try {
    const token = req.cookies && req.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const user = await userModel.findById(decoded.id).select("_id");

      if (user) {
        return res.redirect("/shop");
      }
    }
  } catch (err) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  let error = req.flash("error");
  let success = req.flash("success");
  res.render("index", { error, success, loggedin: false });
});

routers.get("/shop", isLoggedin, async function (req, res) {
  const products = await productModel.find(); // ✅ define it first
  let success = req.flash("success");

  res.render("shop", { products, user: req.user, success }); // ✅ pass products to the view
});

routers.get("/addtocart/:productid", isLoggedin, async function (req, res) {
  const user = await userModel.findById(req.user._id);

  if (!user) {
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    req.flash("error", "User not found");
    return res.redirect("/");
  }

  const existingCartItem = user.cart.find(
    (item) => item.product && item.product.toString() === req.params.productid,
  );

  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    user.cart.push({
      product: req.params.productid,
      quantity: 1,
    });
  }

  await user.save();
  const message = "Product added to cart successfully!";

  if (req.xhr || req.headers.accept?.includes("application/json")) {
    return res.json({ success: true, message });
  }

  req.flash("success", message);
  return res.redirect("/shop");
});

routers.get("/ownerlogin", function (req, res) {
  try {
    const ownerToken = req.cookies && req.cookies.ownerToken;

    if (ownerToken) {
      const decoded = jwt.verify(ownerToken, process.env.JWT_KEY);

      ownerModel
        .findById(decoded.id)
        .select("_id activeSessionId")
        .then((owner) => {
          if (
            owner &&
            decoded.role === "owner" &&
            owner.activeSessionId &&
            owner.activeSessionId === decoded.ownerSessionId
          ) {
            return res.redirect("/owners/admin");
          }

          res.clearCookie("ownerToken", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });

          let error = req.flash("error");
          let success = req.flash("success");
          return res.render("owner-login", { error, success, loggedin: false });
        })
        .catch(() => {
          res.clearCookie("ownerToken", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });

          let error = req.flash("error");
          let success = req.flash("success");
          return res.render("owner-login", { error, success, loggedin: false });
        });

      return;
    }
  } catch (err) {
    res.clearCookie("ownerToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  let error = req.flash("error");
  let success = req.flash("success");
  res.render("owner-login", { error, success, loggedin: false });
});

routers.get("/ownerregister", function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("owner-register", { error, success, loggedin: false });
});

module.exports = routers;
