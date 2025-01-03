const jwt = require("jsonwebtoken");
const { compareBlackListedToken } = require("../mvc/models/auth.model");

const forgotPasswordTokenChecker = async (req, res, next) => {
  const { forgotPasswordToken } = req.body;

  if (!forgotPasswordToken) {
    return res.status(400).json({ success: false, msg: "Token is missing" });
  }

  try {
    const decodedToken = jwt.verify(forgotPasswordToken, process.env.JWT_USER_PASSWORD_RESET_SECRET);
    req.userEmail = decodedToken.userEmail;
    req.forgotPasswordToken = forgotPasswordToken;

    await compareBlackListedToken(decodedToken);

    next();
  } catch (err) {
    return next(err);
  }
};

module.exports = forgotPasswordTokenChecker;
