const ObjectId = require("mongoose").Types.ObjectId;
// const GratisUser = require("../models/user");
const jwt_decode = require("jwt-decode");

// Original auth check (commented out for now)
exports.authCheck = async (req, res, next) => {
  // Temporary bypass for development
  console.log("⚠️ WARNING: Using temporary auth bypass");
  req.user = { email: "temp@example.com", role: "admin" };
  next();

  // Original implementation (commented out)
  /*
  try {
    const jwtDecode = jwt_decode(req.headers.authtoken);
    req.user = jwtDecode;
    next();
  } catch (error) {
    res.status(401).json({
      err: "Invalid or expired token",
    });
  }
  */
};

// Simple auth middleware for ingredient routes
exports.auth = (req, res, next) => {
  // Temporary bypass for development
  console.log("⚠️ WARNING: Using temporary auth bypass for ingredient routes");
  req.user = { email: "temp@example.com", role: "admin" };
  next();
};

exports.adminGratisCheck = async (req, res, next) => {
  // Temporary bypass for development
  console.log("⚠️ WARNING: Using temporary admin check bypass");
  next();

  // Original implementation (commented out)
  /*
  const { email } = req.user;
  const estoreid = req.headers.estoreid;

  const adminUser = await GratisUser.findOne({
    email,
    estoreid: new ObjectId(estoreid),
  }).exec();

  if (["admin", "moderator", "cashier"].includes(adminUser.role)) {
    next();
  } else {
    res.status(403).json({
      error: "Admin resource. Access denied.",
    });
  }
  */
};
