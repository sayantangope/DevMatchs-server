const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized: No token");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {});
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).send("Unauthorized: No token");
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send("Invalid or expired token");
  }
};

module.exports = {
  userAuth,
};
