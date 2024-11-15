const { getAllUsers, getUser, postUser, attemptLogin, updateUser } = require("../models/user.model");
const jwt = require("jsonwebtoken");

exports.fetchAllUsers = async (req, res, next) => {
  try {
    const data = await getAllUsers();
    res.json({ success: true, msg: "Users has been fetched", data: data });
  } catch (err) {
    next(err);
  }
};

exports.fetchUserById = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
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

exports.editUserById = async (req, res, next) => {
  try {
    console.log("1");
    const user_id = req.params.user_id;
    const body = req.body;
    console.log(user_id, body);
    const data = await updateUser(user_id, body);
    res.json({ success: true, msg: "User has been updated", data: data });
  } catch (err) {
    next(err);
  }
};

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
  res.clearCookie("userAuthToken", {
    httpOnly: true,
    path: "/",
    sameSite: "None",
    secure: true,
  });
  return res.status(200).json({ success: true, message: "Logged out successfully", data: null });
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
