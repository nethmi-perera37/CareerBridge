
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Check whether the user is logged in
async function protect(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please log in to continue.",
      });
    }

    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired login token.",
    });
  }
}

// Check whether the logged-in user is a company
function companyOnly(req, res, next) {
  if (req.user?.role !== "company") {
    return res.status(403).json({
      message: "Only company accounts can manage internships.",
    });
  }

  next();
}

module.exports = { protect, companyOnly };
