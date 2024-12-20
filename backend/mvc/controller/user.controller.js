const { getAllUsers, getUser, updateUser, getAllFilesBelongToUserById } = require("../models/user.model");
const { createRefreshToken, createAccessToken, createBlacklistedToken, createCookie } = require("../models/auth.model");
const jwt = require("jsonwebtoken");

// Admin
exports.fetchAllUsers = async (req, res, next) => {
  try {
    const data = await getAllUsers();
    res.json({ success: true, msg: "Users have been fetched", data: data });
  } catch (err) {
    next(err);
  }
};

// User
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

// User
exports.editUserById = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const loggedInUserId = req.userData.id.toString();

    if (user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const body = req.body;
    const data = await updateUser(user_id, body);

    const oldRefreshToken = req.cookies.refreshToken;
    const oldAccessToken = req.cookies.accessToken;

    let accessTokenExpirationInSeconds;
    let refreshTokenExpirationInSeconds;

    if (oldRefreshToken) {
      const decodedRefreshToken = jwt.decode(oldRefreshToken);
      // console.log(decodedRefreshToken.exp - Math.floor(Date.now() / 1000));
      refreshTokenExpirationInSeconds = decodedRefreshToken.exp - Math.floor(Date.now() / 1000);
      await createBlacklistedToken(oldRefreshToken);
      res.clearCookie("accessToken", {
        httpOnly: true,
        path: "/",
        sameSite: "None",
        secure: true,
      });
    }

    if (oldAccessToken) {
      const decodedAccessToken = jwt.decode(oldAccessToken);
      // console.log(decodedAccessToken.exp - Math.floor(Date.now() / 1000));
      accessTokenExpirationInSeconds = decodedAccessToken.exp - Math.floor(Date.now() / 1000);
      await createBlacklistedToken(oldAccessToken);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        path: "/",
        sameSite: "None",
        secure: true,
      });
    }

    const newRefreshToken = await createRefreshToken(data.id, refreshTokenExpirationInSeconds);
    const newAccessToken = await createAccessToken(data, accessTokenExpirationInSeconds);

    await createCookie({
      res,
      cookieValue: newRefreshToken,
      cookieName: "refreshToken",
      cookieMaxAgeInSeconds: refreshTokenExpirationInSeconds,
    });

    await createCookie({
      res,
      cookieValue: newAccessToken,
      cookieName: "accessToken",
      cookieMaxAgeInSeconds: accessTokenExpirationInSeconds,
    });

    res.json({ success: true, msg: "User has been updated", data: data });
  } catch (err) {
    next(err);
  }
};

// User
exports.fetchAllFilesBelongToUserId = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const loggedInUserId = req.userData.id.toString();

    if (user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const data = await getAllFilesBelongToUserById(user_id);
    res.json({ success: true, msg: "Files has been fetch", data: data });
  } catch (err) {
    next(err);
  }
};
