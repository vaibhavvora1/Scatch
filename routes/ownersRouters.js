// express setup
const express = require("express");

//routers setup
const routers = express.Router();

//ownermodel
const ownermodel = require("../models/owner-model");

//make create route for owner and ye development ke time hi chalega
if (process.env.NODE_ENV === "development") { 
  routers.post("/create", async function (req, res) {  
    let owners = await ownermodel.find();
    if (owners.length > 0) {
      return res.status(503).send("you don't have permission to create owner");
    }

    let { fullname, email, password } = req.body; 

    let createdowner = await ownermodel.create({
      fullname,
      email,
      password,
    });
    res.status(201).send(createdowner);
  });
}

// make routers
routers.get("/", function (req, res) {
  res.send("heyy its working ");
});

//export routers
module.exports = routers;
