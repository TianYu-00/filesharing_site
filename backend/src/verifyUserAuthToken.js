const jwt = require("jsonwebtoken");

const verifyUserAuthToken = async (req, res, next) => {
  try {
    const token = req.cookies.userAuthToken;
    if (!token) {
      return res.status(401).json({ success: false, msg: "Token Not Available" });
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_USER_AUTH_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    req.userData = decoded.userData;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: "Invalid token", error: err.message });
  }
};

module.exports = verifyUserAuthToken;
