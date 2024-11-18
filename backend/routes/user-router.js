const express = require("express");
const userController = require("../mvc/controller/user.controller");
const userRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const verifyUserAuthToken = require("../src/verifyUserAuthToken");

userRouter.get("/", verifyUserAuthToken, checkAdminRole, userController.fetchAllUsers);
userRouter.get("/:user_id", verifyUserAuthToken, userController.fetchUserById);
userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.patch("/:user_id", verifyUserAuthToken, userController.editUserById);
userRouter.post("/logout", userController.logoutUser);
userRouter.post("/send-password-reset-link", userController.sendPasswordResetLink);
userRouter.post("/verify-password-reset-token", userController.verifyPasswordResetToken);
userRouter.get("/:user_id/files", userController.fetchAllFilesBelongToUserId);

module.exports = userRouter;
