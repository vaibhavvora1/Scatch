const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/scatch");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  }
}
connectDB();

module.exports = mongoose.connection;
