const express = require("express");
const userController = require("../mvc/controller/user.controller");
const userRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const userTokenChecker = require("../src/userTokenChecker");

// admin only
userRouter.get("/", userTokenChecker, checkAdminRole, userController.fetchAllUsers);

// should be protected
userRouter.get("/:user_id", userTokenChecker, userController.fetchUserById);
userRouter.patch("/:user_id", userTokenChecker, userController.editUserById);
userRouter.get("/:user_id/files", userTokenChecker, userController.fetchAllFilesBelongToUserId);

// for all

module.exports = userRouter;

// userRouter.post("/register", userController.registerUser);
// userRouter.post("/login", userController.loginUser);
// userRouter.post("/logout", userController.logoutUser);
// userRouter.post("/send-password-reset-link", userController.sendPasswordResetLink);
// userRouter.post("/verify-password-reset-token", userController.verifyPasswordResetToken);
