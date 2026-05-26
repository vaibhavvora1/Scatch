const express = require("express");
const routers = express.Router();

const isOwner = require("../middlewares/isowner");

// Controllers
const {
  ownerlogin,
  ownerregister,
  ownerlogout,
} = require("../controllers/authcontroller");

/* ================= OWNER REGISTER (DEV ONLY) ================= */
if (process.env.NODE_ENV === "development") {
  routers.post("/ownerregister", ownerregister);
}

routers.post("/login", ownerlogin);
routers.get("/ownerlogout", ownerlogout);

/* ================= ADMIN PANEL ================= */
routers.get("/admin", isOwner, function (req, res) {
  let success = req.flash("success");

  res.render("createproducts", {
    success,
    loggedin: false,
    owner: req.owner,
  });
});

module.exports = routers;
