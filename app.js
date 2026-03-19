const express = require("express");
const app = express();

const cookieparser = require("cookie-parser");
const path = require("path");

const db = require("./config/mogoose-connect");
const ownersRouters = require("./routes/ownersRouters");
const usersRouters = require("./routes/usersRouters");
const productsRouters = require("./routes/productsRouters");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(cookieparser());

app.use("/owners", ownersRouters);
app.use("/users", usersRouters);
app.use("/products", productsRouters);

app.listen(3000, function () {
  console.log("server is running on port 3000");
});
