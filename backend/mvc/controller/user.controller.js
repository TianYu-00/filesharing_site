const { getAllUsers, getUser, postUser, attemptLogin, updateUser } = require("../models/user.model");
const jwt = require("jsonwebtoken");

const checkAdminRole = require("../../src/checkAdminRole");
const verifyUserAuthToken = require("../../src/verifyUserAuthToken");

exports.fetchAllUsers = [
  verifyUserAuthToken,
  checkAdminRole,
  async (req, res, next) => {
    try {
      const data = await getAllUsers();
      res.json({ success: true, msg: "Users have been fetched", data: data });
    } catch (err) {
      next(err);
    }
  },
];

exports.fetchUserById = [
  verifyUserAuthToken,
  async (req, res, next) => {
    try {
      const user_id = req.params.user_id;
      const loggedInUserId = req.userData.id;

      if (user_id !== loggedInUserId && req.userData.role !== "admin") {
        return res.status(403).json({ success: false, msg: "Access denied" });
      }

      const data = await getUser(user_id);
      res.json({ success: true, msg: "User has been fetched", data: data });
    } catch (err) {
      next(err);
    }
  },
];

exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const data = await postUser({ username, email, password });

    signJWTAndCreateCookie(res, data);
    res.json({ success: true, msg: "User has been created", data: data });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await attemptLogin({ email, password });

    signJWTAndCreateCookie(res, data);

    res.json({ success: true, msg: "Login approved", data: data });
  } catch (err) {
    next(err);
  }
};

exports.editUserById = [
  verifyUserAuthToken,
  async (req, res, next) => {
    try {
      const user_id = req.params.user_id;
      const loggedInUserId = req.userData.id;

      if (user_id !== loggedInUserId && req.userData.role !== "admin") {
        return res.status(403).json({ success: false, msg: "Access denied" });
      }

      const body = req.body;
      const data = await updateUser(user_id, body);
      res.json({ success: true, msg: "User has been updated", data: data });
    } catch (err) {
      next(err);
    }
  },
];

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.userAuthToken;
    if (!token) {
      return res.json({ success: false, msg: "Token Not Available", data: null });
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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
    return res.status(200).json({ success: true, message: "Logged out successfully", data: null });
  } catch (err) {
    next(err);
  }
};

const signJWTAndCreateCookie = (res, userData) => {
  const token = jwt.sign({ userData: userData }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.cookie("userAuthToken", token, {
    httpOnly: true,
    maxAge: 3600 * 1000,
    path: "/",
    sameSite: "None",
    secure: true,
  });
};
