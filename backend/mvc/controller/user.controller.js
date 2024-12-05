const {
  getAllUsers,
  getUser,
  postUser,
  attemptLogin,
  updateUser,
  getUserByEmail,
  patchUserPasswordByEmail,
  getAllFilesBelongToUserById,
} = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../src/sendEmail");
const rateLimit = require("express-rate-limit");

exports.fetchAllUsers = async (req, res, next) => {
  try {
    const data = await getAllUsers();
    res.json({ success: true, msg: "Users have been fetched", data: data });
  } catch (err) {
    next(err);
  }
};

exports.fetchUserById = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const loggedInUserId = req.userData.id.toString();

    if (user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const data = await getUser(user_id);
    res.json({ success: true, msg: "User has been fetched", data: data });
  } catch (err) {
    next(err);
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const data = await postUser({ username, email, password });

    signUserAuthJWTAndCreateCookie(res, data, false);
    res.json({ success: true, msg: "User has been created", data: data });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password, isRememberMe } = req.body;
    const data = await attemptLogin({ email, password });

    signUserAuthJWTAndCreateCookie(res, data, isRememberMe);

    res.json({ success: true, msg: "Login approved", data: data });
  } catch (err) {
    next(err);
  }
};

exports.editUserById = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const loggedInUserId = req.userData.id.toString();

    if (user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const body = req.body;
    const data = await updateUser(user_id, body);
    res.json({ success: true, msg: "User has been updated", data: data });
  } catch (err) {
    next(err);
  }
};

exports.validateUserAuthToken = async (req, res, next) => {
  try {
    const token = req.cookies.userAuthToken;
    if (!token) {
      return res.json({ success: false, msg: "Token Not Available", data: null });
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

    res.json({ success: true, msg: "Verified successfully", data: decoded.userData });
  } catch (err) {
    next(err);
  }
};

exports.logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("userAuthToken", {
      httpOnly: true,
      path: "/",
      sameSite: "None",
      secure: true,
    });
    return res.status(200).json({ success: true, msg: "Logged out successfully", data: null });
  } catch (err) {
    next(err);
  }
};

const signUserAuthJWTAndCreateCookie = (res, userData, isRememberMe) => {
  let expiresInSecond;
  if (!isRememberMe) {
    // 1 hour = 3600 seconds
    expiresInSecond = 3600;
  } else {
    // 30 days = 2592000 seconds
    expiresInSecond = 2592000;
  }
  const token = jwt.sign({ userData: userData }, process.env.JWT_USER_AUTH_SECRET, { expiresIn: expiresInSecond });

  res.cookie("userAuthToken", token, {
    httpOnly: true,
    maxAge: expiresInSecond * 1000,
    path: "/",
    sameSite: "None",
    secure: true,
  });
};

const emailSendingSuccessfulRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: "Email has already been sent, Please wait and try again after a minute.",
  handler: (req, res) => {
    const coolDown = Math.ceil((req.rateLimit.resetTime - new Date()) / 1000);
    return res.status(429).json({
      success: false,
      msg: `Too many email sending requests. Please wait ${coolDown} seconds.`,
      data: { coolDown },
    });
  },
});

const emailSendingRequestRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many password reset requests. Please wait and try again after a minute.",
  handler: (req, res) => {
    const coolDown = Math.ceil((req.rateLimit.resetTime - new Date()) / 1000);
    return res.status(429).json({
      success: false,
      msg: `Too many password reset requests. Please wait ${coolDown} seconds.`,
      data: { coolDown },
    });
  },
});

exports.sendPasswordResetLink = [
  emailSendingRequestRateLimiter,
  async (req, res, next) => {
    try {
      const seconds = 900;
      const { email } = req.body;
      const user = await getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found", data: null });
      }

      const token = jwt.sign({ email }, process.env.JWT_USER_PASSWORD_RESET_SECRET, { expiresIn: seconds });
      const resetLink = `${process.env.FRONTEND_URL}/password-reset-confirm?token=${token}`;

      const textContent = `
        Hello,

        We received a request to reset the password for your DropBoxer account. Please use the following link to reset your password:

        ${resetLink}

        The link will expire in 15 minutes.

        If you did not request a password reset, please ignore this email.

        Please note: This is an automated message. Do not reply to this email as it won't be monitored.

        If you have any issues, feel free to contact our support team.

        Thanks,
        The DropBoxer Team
      `;

      emailSendingSuccessfulRateLimiter(req, res, async () => {
        const response = await sendEmail(email, "DropBoxer Password Reset", textContent);

        if (response.success) {
          res.status(200).json({ success: true, msg: response.message, data: null });
        } else {
          res.status(500).json({ success: false, msg: response.message, data: null });
        }
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.verifyPasswordResetToken = async (req, res, next) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_USER_PASSWORD_RESET_SECRET);
    res
      .status(200)
      .json({ success: true, msg: "Token validated successfully", data: { email: decoded.email, isValid: true } });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, msg: "Invalid token or token has expired", data: { email: null, isValid: false } });
  }
};

exports.resetPasswordByEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, msg: "Email and password are required." });
    }

    const user = await patchUserPasswordByEmail(email, password);

    res.status(200).json({ success: true, msg: "Password has been updated", data: null });
  } catch (err) {
    next(err);
  }
};

exports.fetchAllFilesBelongToUserId = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const data = await getAllFilesBelongToUserById(user_id);
    res.json({ success: true, msg: "Files has been fetch", data: data });
  } catch (err) {
    next(err);
  }
};
