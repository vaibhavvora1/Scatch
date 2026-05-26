const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for a user or owner.
 * @param {Object} user - The user/owner document
 * @param {string} role  - "user" | "owner"
 */
function generateToken(user, role = "user", extra = {}) {
  return jwt.sign(
    { id: user._id, email: user.email, role, ...extra },
    process.env.JWT_KEY,
    { expiresIn: "7d" },
  );
}

module.exports = generateToken;
