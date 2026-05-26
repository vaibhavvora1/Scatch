const usermodel = require("../models/user-model");
const validateuser = require("../validation/uservalidation");
const bcrypt = require("bcrypt"); //for password hashing
const jwt = require("jsonwebtoken"); //for token generation
const crypto = require("crypto");
const gettoken = require("../utils/gettoken"); //for token generation
const ownermodel = require("../models/owner-model"); //for owner model

const tokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === "production",
};

module.exports.registeruser = async function (req, res) {
  //register route
  try {
    validateuser; //validate request body

    let { fullname, email, password } = req.body; //destructure

    if (!fullname || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/");
    }

    email = email.trim().toLowerCase();

    // ✅ check if user exists
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      req.flash("error", "User already registered. Please go to login page.");
      return res
        .status(400)

        .redirect("/");
    }
    //hash password
    bcrypt.genSalt(10, function (err, salt) {
      //generate salt
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) {
          console.log(err.message);
        } else {
          //create user
          let user = await usermodel.create({
            fullname,
            email,
            password: hash,
          });
          // Keep registration and login separate so the user returns to the login page.
          req.flash(
            "success",
            `${user.fullname} registered successfully. Please log in.`,
          );
          return res.redirect("/");
        }
      });
    });
  } catch (error) {
    if (error.code === 11000) {
      req.flash("error", "User already registered. Please go to login page.");
      return res.status(400).redirect("/");
    }

    console.log(error.message);
    req.flash("error", "Internal Server Error");
    return res.status(500).redirect("/");
  }
};

module.exports.loginuser = async function (req, res) {
  try {
    // 1. Validate properly
    // validateuser(req.body); // assuming function

    let { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Email and password required");
      return res.status(400).redirect("/");
    }

    email = email.trim().toLowerCase();

    // 2. Check user
    let loggeduser = await usermodel.findOne({ email });

    if (!loggeduser) {
      req.flash("error", "Email or password is incorrect");
      return res.status(401).redirect("/");
    }

    // 3. Compare password (SAFE way)
    const result = await bcrypt.compare(password, loggeduser.password);

    if (!result) {
      req.flash("error", "Email or password is incorrect");
      return res.status(401).redirect("/");
    }

    // 4. Generate token
    let token = gettoken(loggeduser);
    res.cookie("token", token, tokenCookieOptions);

    // 5. Success
    return res.redirect("/shop");
  } catch (err) {
    console.error(err);
    req.flash("error", "Internal Server Error");
    return res.status(500);
  }
};
module.exports.logoutuser = function (req, res) {
  //logout route
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }); //clear token cookie
  req.flash("success", "Logged out successfully");
  return res.redirect("/");
};

module.exports.ownerlogin = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Email and password are required");
      return res.status(400).redirect("/ownerlogin");
    }

    const owner = await ownermodel.findOne({ email });

    if (!owner) {
      req.flash("error", "Invalid owner credentials");
      return res.status(401).redirect("/ownerlogin");
    }

    const isMatch = await bcrypt.compare(password, owner.password);

    if (!isMatch) {
      req.flash("error", "Invalid owner credentials");
      return res.status(401).redirect("/ownerlogin");
    }

    // Always rotate to a fresh owner session so the owner can log in again anytime.
    const ownerSessionId = crypto.randomBytes(24).toString("hex");
    owner.activeSessionId = ownerSessionId;
    await owner.save();

    const token = jwt.sign(
      {
        email: owner.email,
        id: owner._id,
        role: "owner",
        ownerSessionId,
      },
      process.env.JWT_KEY,
      { expiresIn: "7d" },
    );
    res.cookie("ownerToken", token, tokenCookieOptions);
    req.flash("success", "Welcome back");

    return res.redirect("/owners/admin");
  } catch (err) {
    console.error(err);
    req.flash("error", "Server error");
    return res.status(500).redirect("/ownerlogin");
  }
};
 
module.exports.ownerregister = async function (req, res) {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      req.flash("error", "All fields are required");
      return res.status(400).redirect("/ownerregister");
    }

    const existingOwner = await ownermodel.findOne();

    if (existingOwner) {
      req.flash("error", "Owner already exists. Permission denied.");
      return res.status(403).redirect("/ownerregister");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await ownermodel.create({
      fullname,
      email,
      password: hashedPassword,
    });

    req.flash("success", "Owner created successfully. Please log in.");
    return res.redirect("/ownerlogin");
  } catch (err) {
    console.error(err);
    req.flash("error", "Server error");
    return res.status(500).redirect("/ownerlogin");
  }
};

module.exports.ownerlogout = async function (req, res) {
  try {
    if (req.cookies && req.cookies.ownerToken) {
      const decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
      const owner = await ownermodel.findById(decoded.id);

      if (
        owner &&
        decoded.role === "owner" &&
        owner.activeSessionId &&
        owner.activeSessionId === decoded.ownerSessionId
      ) {
        owner.activeSessionId = null;
        await owner.save();
      }
    }
  } catch (err) {
    console.log(err.message);
  }

  res.clearCookie("ownerToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  req.flash("success", "Owner logged out successfully");
  return res.redirect("/ownerlogin");
};
