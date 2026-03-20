// mongoose setup
const mongoose = require("mongoose");
const config = require("config");

const dbgr = require("debug")("development:mongoose");

//connect database server with error handling

mongoose
  .connect(`${config.get("MONGODB_URI")}/scatch`)
  .then(function () {
    dbgr("connected");
  })
  .catch(function (err) {
    dbgr(err);
  });

//export database connection
module.exports = mongoose.connection;
