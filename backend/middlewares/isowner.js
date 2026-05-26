const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

/**
 * Middleware: verifies JWT from Authorization header, checks role === "owner".
 * Attaches req.owner if valid.
 */
module.exports = async function isOwner(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized – no owner token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    if (decoded.role !== "owner") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden – owner access only" });
    }

    const owner = await ownerModel.findById(decoded.id).select("-password");
    if (!owner) {
      return res
        .status(401)
        .json({ success: false, message: "Owner not found" });
    }

    if (
      !owner.activeSessionId ||
      owner.activeSessionId !== decoded.ownerSessionId
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid owner session" });
    }

    req.owner = owner;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired owner token" });
  }
};
