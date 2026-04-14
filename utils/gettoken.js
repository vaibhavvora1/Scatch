const jwt = require("jsonwebtoken"); //for token generation

const gettoken = function (user) {
  return jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY, {
    expiresIn: "7d",
  });
};

module.exports = gettoken;
