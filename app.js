//express setup
const express = require("express");
const app = express();

//cookie parser setup
const cookieparser = require("cookie-parser");

//path setup
const path = require("path");

// database connection from config
const db = require("./config/mogoose-connect");

//routes setup
const ownersRouters = require("./routes/ownersRouters");
const usersRouters = require("./routes/usersRouters");
const productsRouters = require("./routes/productsRouters");

//middleware setup  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(cookieparser());


//routes
app.use("/owners", ownersRouters);
app.use("/users", usersRouters);
app.use("/products", productsRouters);

app.listen(3000, function () {
  console.log("server is running on port 3000");
});
