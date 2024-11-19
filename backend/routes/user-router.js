const express = require("express");
const userController = require("../mvc/controller/user.controller");
const userRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const verifyUserAuthToken = require("../src/verifyUserAuthToken");

userRouter.get("/", verifyUserAuthToken, checkAdminRole, userController.fetchAllUsers);
// userRouter.get("/:user_id", verifyUserAuthToken, userController.fetchUserById);
userRouter.post("/register", userController.registerUser); // used
userRouter.post("/login", userController.loginUser); // used
userRouter.patch("/:user_id", verifyUserAuthToken, userController.editUserById); // used
userRouter.post("/logout", userController.logoutUser); // used
userRouter.post("/send-password-reset-link", userController.sendPasswordResetLink); // used
userRouter.post("/verify-password-reset-token", userController.verifyPasswordResetToken); // used
userRouter.get("/:user_id/files", userController.fetchAllFilesBelongToUserId); // used

module.exports = userRouter;
