const express = require("express");
const userController = require("../mvc/controller/user.controller");
const userRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const verifyUserAuthToken = require("../src/verifyUserAuthToken");

// admin only
userRouter.get("/", verifyUserAuthToken, checkAdminRole, userController.fetchAllUsers);

// should be protected
userRouter.get("/:user_id", verifyUserAuthToken, userController.fetchUserById);
userRouter.patch("/:user_id", verifyUserAuthToken, userController.editUserById);
userRouter.get("/:user_id/files", verifyUserAuthToken, userController.fetchAllFilesBelongToUserId);

// for all
userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.post("/logout", userController.logoutUser);
userRouter.post("/send-password-reset-link", userController.sendPasswordResetLink);
userRouter.post("/verify-password-reset-token", userController.verifyPasswordResetToken);

module.exports = userRouter;
