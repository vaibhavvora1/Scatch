require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();

// ── DB ───────────────────────────────────────────────────────
require("./config/mogoose-connect");

const allowed = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "https://scatch-snowy.vercel.app",
  ...(process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again later." },
});

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.has(origin.replace(/\/$/, ""))) {
        cb(null, true);
      } else {
        cb(new Error("CORS blocked"));
      }
    },
    credentials: true,
  }),
);

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/api", apiLimiter);

// ── Static uploads folder ────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ───────────────────────────────────────────────
app.use("/api/auth", authLimiter, require("./routes/api/auth"));
app.use("/api/products", require("./routes/api/products"));
app.use("/api/cart", require("./routes/api/cart"));
app.use("/api/orders", require("./routes/api/orders"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/admin", require("./routes/api/admin"));
app.use("/api/wishlist", require("./routes/api/wishlist"));
app.use("/api/sellers", require("./routes/api/sellers"));

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── 404 fallback ─────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const isProduction = process.env.NODE_ENV === "production";
  const message = isProduction && !err.status ? "Server error" : err.message || "Server error";
  res
    .status(err.status || 500)
    .json({ success: false, message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Scatch API running on port ${PORT}`));
