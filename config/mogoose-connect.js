// mongoose setup
const mongoose = require("mongoose"); //for database connection
require("dotenv").config(); //for environment variables

const dbgr = require("debug")("development:mongoose"); //for debugging

//connect database server with error handling

mongoose
  .connect(process.env.MONGO_URI) //connect to database server
  .then(function () {
    //database connection successful
    dbgr("connected");
  })
  .catch(function (err) {
    dbgr(err);
  });

//export database connection
module.exports = mongoose.connection;
