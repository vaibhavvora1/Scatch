// express setup
const express = require("express");

//routers setup
const routers = express.Router();

// make routers
routers.get("/", function (req, res) {
  res.send("heyy its working ");
});

//exports routes

module.exports = routers;
