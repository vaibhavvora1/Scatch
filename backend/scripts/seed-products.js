require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/product-model");

const imagePath = (fileName) => path.join(__dirname, "..", "images", fileName);

function toDataUri(fileName, mimeType = "image/png") {
  const filePath = imagePath(fileName);
  if (!fs.existsSync(filePath)) return "";
  return `data:${mimeType};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

const products = [
  {
    name: "The Leather Guild",
    description: "Structured brown carryall with a polished luxury finish.",
    price: 200000,
    discount: 10,
    category: "accessories",
    badge: "featured",
    stock: 12,
    bgcolor: "#F4DDD2",
    panelcolor: "#DEBEAE",
    textcolor: "#774F3D",
    image: toDataUri("1bag.png"),
  },
  {
    name: "Chanel Classic Flap",
    description: "Timeless quilted blue handbag for statement styling.",
    price: 250000,
    discount: 8,
    category: "accessories",
    badge: "trending",
    stock: 8,
    bgcolor: "#d8e3f8",
    panelcolor: "#9bb4df",
    textcolor: "#193763",
    image: toDataUri("2bag.png"),
  },
  {
    name: "Dune Heritage Handbag",
    description: "Warm neutral handbag with refined everyday utility.",
    price: 500000,
    discount: 12,
    category: "accessories",
    badge: "best-seller",
    stock: 5,
    bgcolor: "#ede0ca",
    panelcolor: "#c8a36d",
    textcolor: "#5f431f",
    image: toDataUri("3bag 1.png"),
  },
  {
    name: "La Vie Rose Carry",
    description: "Royal pink carry bag with a soft premium silhouette.",
    price: 150000,
    discount: 5,
    category: "accessories",
    badge: "new-arrival",
    stock: 16,
    bgcolor: "#f7dce8",
    panelcolor: "#d58bad",
    textcolor: "#7d2d52",
    image: toDataUri("4bag.png"),
  },
  {
    name: "Core & Carry Shopper",
    description: "Daily shopping bag with clean lines and roomy storage.",
    price: 90000,
    discount: 7,
    category: "accessories",
    badge: "none",
    stock: 20,
    bgcolor: "#e5e7eb",
    panelcolor: "#9ca3af",
    textcolor: "#1f2937",
    image: toDataUri("5bag.png"),
  },
  {
    name: "Oyster Perpetual 36",
    description: "Refined watch-inspired piece for sharp formal looks.",
    price: 780000,
    discount: 6,
    category: "accessories",
    badge: "featured",
    stock: 4,
    bgcolor: "#d8f3dc",
    panelcolor: "#74c69d",
    textcolor: "#1b4332",
    image: toDataUri(
      "rolex-new-watches-2026-the-oyster-perpetual-36-m126000-0016-landscape.jpg",
      "image/jpeg",
    ),
  },
  {
    name: "Midnight Travel Tote",
    description: "Deep-toned tote built for travel, work, and weekends.",
    price: 180000,
    discount: 9,
    category: "accessories",
    badge: "trending",
    stock: 10,
    bgcolor: "#dbeafe",
    panelcolor: "#60a5fa",
    textcolor: "#172554",
    image: toDataUri("6bag.png"),
  },
  {
    name: "Signature Mini Bag",
    description: "Compact statement bag with elevated finishing details.",
    price: 120000,
    discount: 4,
    category: "accessories",
    badge: "new-arrival",
    stock: 14,
    bgcolor: "#fef3c7",
    panelcolor: "#f59e0b",
    textcolor: "#78350f",
    image: toDataUri("7bag.png"),
  },
];

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existingCount = await Product.countDocuments();

  if (existingCount > 0 && !process.argv.includes("--force")) {
    console.log(`Products already exist (${existingCount}). Use --force to replace them.`);
    return;
  }

  if (process.argv.includes("--force")) {
    await Product.deleteMany({});
  }

  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
}

seed()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
