// express setup
const express = require("express");

//prouct model setup
const productmodel = require("../models/product-model");

//multer setup
const upload = require("../config/multer-config");
const isOwner = require("../middlewares/isowner");

//routers setup
const routers = express.Router();

// make routers
routers.post("/create", isOwner, upload.single("image"), async function (req, res) {
  //create route for product creation
  try {
    let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
    let products = await productmodel.create({
      image: req.file.buffer,
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    });
    req.flash("success", "product created successfully");
    res.redirect("/owners/admin");
  } catch (err) {
    res.status(500).send(" error creating product " + err.message);
  }
});

//export routers
module.exports = routers;
