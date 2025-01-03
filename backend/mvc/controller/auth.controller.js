const {
  getAllBlackListTokens,
  createRefreshToken,
  createAccessToken,
  createUser,
  authenticateUser,
  createBlacklistedToken,
  createCookie,
  createForgotPasswordToken,
} = require("../models/auth.model");
const { getUserByEmail, patchUserPasswordByEmail } = require("../models/user.model");
const sendEmail = require("../../src/sendEmail");
const rateLimit = require("express-rate-limit");

exports.fetchAllBlacklistTokens = async (req, res, next) => {
  try {
    const data = await getAllBlackListTokens();
    res.json({ success: true, msg: "Blacklisted token has been fetched", data: data });
  } catch (err) {
    next(err);
  }
};

exports.testUserTokens = async (req, res, next) => {
  try {
    const data = req.userData;
    res.json({ success: true, msg: "Verified successfully", data: data });
  } catch (err) {
    next(err);
  }
};

exports.attemptRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      const error = new Error("Missing credentials");
      error.code = "MISSING_CREDENTIALS";
      return next(error);
    }
    const data = await createUser({ username, email, password });

    req.user = data;

    const refreshToken = await createRefreshToken(data.id);
    const accessToken = await createAccessToken(data);
    await createCookie({ res, cookieValue: refreshToken, cookieName: "refreshToken", cookieMaxAgeInSeconds: 2592000 });
    await createCookie({ res, cookieValue: accessToken, cookieName: "accessToken", cookieMaxAgeInSeconds: 900 });

    res.json({ success: true, msg: "User has been created", data: data });
  } catch (err) {
    next(err);
  }
};

exports.attemptLogin = async (req, res, next) => {
  try {
    const { email, password, isRememberMe = false } = req.body;
    if (!email || !password) {
      const error = new Error("Missing credentials");
      error.code = "MISSING_CREDENTIALS";
      return next(error);
    }

    const data = await authenticateUser({ email, password });

    req.user = data;

    let refreshExpireInSeconds;

    if (isRememberMe) {
      refreshExpireInSeconds = 2592000; // 2592000 = 30 days
    } else {
      refreshExpireInSeconds = 3600; // 3600 = 1 hour
    }

    const accessExpireInSeconds = 900; // 900 = 15 min

    const refreshToken = await createRefreshToken(data.id, refreshExpireInSeconds);
    const accessToken = await createAccessToken(data, accessExpireInSeconds);

    await createCookie({
      res,
      cookieValue: refreshToken,
      cookieName: "refreshToken",
      cookieMaxAgeInSeconds: refreshExpireInSeconds,
    });
    await createCookie({
      res,
      cookieValue: accessToken,
      cookieName: "accessToken",
      cookieMaxAgeInSeconds: accessExpireInSeconds,
    });

    res.json({ success: true, msg: "Logged in successfully", data: data });
  } catch (err) {
    next(err);
  }
};

exports.attemptLogout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;

    if (refreshToken) {
      await createBlacklistedToken(refreshToken);
      res.clearCookie("accessToken", {
        httpOnly: true,
        path: "/",
        sameSite: "None",
        secure: true,
      });
    }

    if (accessToken) {
      await createBlacklistedToken(accessToken);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        path: "/",
        sameSite: "None",
        secure: true,
      });
    }

    res.json({ success: true, msg: "User logged out successfully", data: null });
  } catch (err) {
    next(err);
  }
};

const emailSendingSuccessfulRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: "Email has already been sent, Please wait and try again after a minute.",
  handler: (req, res) => {
    if (process.env.NODE_ENV === "test") {
      return next();
    }
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
    if (process.env.NODE_ENV === "test") {
      return next();
    }
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
      const { email, isTest } = req.body;
      if (!email) {
        const error = new Error("Missing credentials");
        error.code = "MISSING_CREDENTIALS";
        return next(error);
      }
      const user = await getUserByEmail(email);

      const forgotPasswordToken = await createForgotPasswordToken(email);

      const resetLink = `${process.env.FRONTEND_URL}/password-reset-confirm?token=${forgotPasswordToken}`;

      let textContent;

      if (process.env.NODE_ENV === "test" || isTest) {
        textContent = `${forgotPasswordToken}`;
      } else {
        textContent = `
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
      }

      emailSendingSuccessfulRateLimiter(req, res, async () => {
        const response = await sendEmail({
          emailTo: email,
          emailSubject: "DropBoxer Password Reset",
          emailText: textContent,
          isTest: isTest,
        });

        if (response.success) {
          res.status(200).json({ success: true, msg: response.message, data: response.data });
        } else {
          res.status(500).json({ success: false, msg: response.message, data: null });
        }
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.resetPassword = async (req, res, next) => {
  try {
    const email = req.userEmail;
    const { password } = req.body;
    const forgotPasswordToken = req.forgotPasswordToken;

    if (!email || !password) {
      return res.status(400).json({ success: false, msg: "Email or Password is missing." });
    }

    const data = await patchUserPasswordByEmail(email, password);
    // console.log(forgotPasswordToken);

    await createBlacklistedToken(forgotPasswordToken);

    res.json({ success: true, msg: "Password has been updated", data: null });
  } catch (err) {
    next(err);
  }
};

exports.verifyForgotPasswordToken = async (req, res, next) => {
  try {
    const data = req.userEmail;
    res.json({ success: true, msg: "Verified successfully", data: { email: data } });
  } catch (err) {
    next(err);
  }
};
