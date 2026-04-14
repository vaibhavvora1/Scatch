//dotenv setup
require("dotenv").config();

//express setup
const express = require("express");
const app = express();

//express session setup
const session = require("express-session");

//session configuration
const flash = require("connect-flash");

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
const indexRouters = require("./routes/index");

//middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(cookieparser());

//session setup
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
  }),
);

//flash setup
app.use(flash());

//routes
app.use("/owners", ownersRouters);
app.use("/users", usersRouters);
app.use("/products", productsRouters);
app.use("/", indexRouters);

app.listen(3000, function () {
  console.log("server is running on port 3000");
});
