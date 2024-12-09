const db = require("../../db/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.getAllBlackListTokens = async () => {
  try {
    const result = await db.query(`SELECT * FROM blacklisted_tokens;`);
    return result.rows;
  } catch (err) {
    console.error(err);
    return Promise.reject({ code: "UNKNOWN_ERROR", message: "Error Unknown" });
  }
};

exports.createRefreshToken = async (user_id, token_expire_seconds = 2592000) => {
  try {
    const jti = crypto.randomBytes(32).toString("hex");
    const tokenType = "refresh";

    const token = jwt.sign({ jti, tokenType, userId: user_id }, process.env.JWT_USER_REFRESH_TOKEN_SECRET, {
      expiresIn: token_expire_seconds,
    });

    return token;
  } catch (err) {
    console.error(err);
    return Promise.reject({ code: "UNKNOWN_ERROR", message: "Error Unknown" });
  }
};

exports.createAccessToken = async (userData, token_expire_seconds = 900) => {
  try {
    const jti = crypto.randomBytes(32).toString("hex");
    const tokenType = "access";

    const token = jwt.sign({ jti, tokenType, userData }, process.env.JWT_USER_ACCESS_TOKEN_SECRET, {
      expiresIn: token_expire_seconds,
    });

    return token;
  } catch (err) {
    console.error(err);
    return Promise.reject({ code: "UNKNOWN_ERROR", message: "Error Unknown" });
  }
};

exports.createForgotPasswordToken = async (user_email, token_expire_seconds = 900) => {
  try {
    const jti = crypto.randomBytes(32).toString("hex");
    const tokenType = "forgot_password";

    const token = jwt.sign({ jti, tokenType, userEmail: user_email }, process.env.JWT_USER_PASSWORD_RESET_SECRET, {
      expiresIn: token_expire_seconds,
    });

    return token;
  } catch (err) {
    console.error(err);
    return Promise.reject({ code: "UNKNOWN_ERROR", message: "Error Unknown" });
  }
};

exports.createUser = async ({ username, email, password }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, email, password)
          VALUES ($1, $2, $3)
          RETURNING id, username, email, created_at, role;
          `,
      [username, email, hashedPassword]
    );

    const { password: _, ...userDataWithoutPassword } = result.rows[0];

    return userDataWithoutPassword;
  } catch (err) {
    if (err.code === "23505" && err.constraint === "users_email_key") {
      return Promise.reject({ code: "DUPLICATE_EMAIL", message: "Email address already in use" });
    }
    return Promise.reject({ code: "UNKNOWN_ERROR", message: "Error Unknown" });
  }
};

exports.authenticateUser = async ({ email, password }) => {
  try {
    const fetchedUserByEmail = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    // console.log(fetchedUserByEmail.rows);
    if (fetchedUserByEmail.rows.length === 0) {
      return Promise.reject({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    const user = fetchedUserByEmail.rows[0];

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return Promise.reject({ code: "INCORRECT_PASSWORD", message: "Incorrect password" });
    }

    const { password: _, ...userDataWithoutPassword } = user;

    return userDataWithoutPassword;
  } catch (err) {
    console.error(err);
    return Promise.reject({ code: "UNKNOWN_ERROR", message: "Error Unknown" });
  }
};

exports.createBlacklistedToken = async (token) => {
  try {
    const decodedToken = jwt.decode(token, { complete: true });

    if (!decodedToken || !decodedToken.payload) {
      return Promise.reject({ code: "INVALID_TOKEN", message: "Token is invalid or missing payload" });
    }

    // all
    const jti = decodedToken?.payload?.jti;
    const tokenType = decodedToken?.payload?.tokenType;
    const expiresAt = new Date(decodedToken?.payload?.exp * 1000);

    // access token
    const userDataId = decodedToken?.payload?.userData?.id || null;

    if (!jti || !tokenType || !expiresAt) {
      return Promise.reject({ code: "MISSING_TOKEN_FIELDS", message: "Missing token fields" });
    }

    const query = `
    INSERT INTO blacklisted_tokens (user_id, jti, token_type, expires_at)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    ;`;

    const values = [userDataId, jti, tokenType, expiresAt];

    const result = await db.query(query, values);

    return result.rows[0];
  } catch (err) {
    console.error(err);
    return Promise.reject({ code: "UNKNOWN_ERROR", message: "Error Unknown" });
  }
};

exports.createCookie = async ({ res, cookieName, cookieValue, cookieMaxAgeInSeconds }) => {
  try {
    res.cookie(cookieName, cookieValue, {
      httpOnly: true,
      maxAge: cookieMaxAgeInSeconds * 1000,
      path: "/",
      sameSite: "None",
      secure: true,
    });
  } catch (err) {
    console.error(err);
    return Promise.reject({ code: "UNKNOWN_ERROR", message: "Error Unknown" });
  }
};

exports.compareBlackListedToken = async (decodedToken) => {
  try {
    const result = await db.query(`SELECT * FROM blacklisted_tokens WHERE jti = $1;`, [decodedToken.jti]);
    if (result.rows.length > 0) {
      return Promise.reject({ code: "BLACKLISTED_TOKEN", message: "Access denied" });
    }
    return result.rows[0];
  } catch (err) {
    console.error(err);
    return Promise.reject({ code: "UNKNOWN_ERROR", message: "Error Unknown" });
  }
};
