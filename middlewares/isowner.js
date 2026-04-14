const jwt = require("jsonwebtoken");
const ownermodel = require("../models/owner-model");

const isOwner = async (req, res, next) => {
  try {
    if (!req.cookies || !req.cookies.ownerToken) {
      req.flash("error", "Please log in as owner");
      return res.redirect("/ownerlogin");
    }

    const decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
    const owner = await ownermodel.findById(decoded.id).select("-password");

    if (!owner) {
      res.clearCookie("ownerToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      req.flash("error", "Owner account not found");
      return res.redirect("/ownerlogin");
    }

    if (
      decoded.role !== "owner" ||
      !owner.activeSessionId ||
      owner.activeSessionId !== decoded.ownerSessionId
    ) {
      res.clearCookie("ownerToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      req.flash("error", "Owner session expired or is already active somewhere else");
      return res.redirect("/ownerlogin");
    }

    req.owner = owner;
    next();
  } catch (err) {
    console.log(err.message);
    res.clearCookie("ownerToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    req.flash("error", "Invalid owner session");
    return res.redirect("/ownerlogin");
  }
};

module.exports = isOwner;
