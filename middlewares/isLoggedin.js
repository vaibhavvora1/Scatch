const jwt = require("jsonwebtoken"); //for token generation

const usermodel = require("../models/user-model"); //for user model

module.exports = async function (req, res, next) {
  try {
    if (!req.cookies || !req.cookies.token) {
      req.flash("error", "You must be logged in");
      return res.redirect("/");
    }

    const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);

    const user = await usermodel.findById(decoded.id).select("-password");

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err.message); // DEBUG
    req.flash("error", "Invalid token");
    return res.redirect("/");
  }
};



