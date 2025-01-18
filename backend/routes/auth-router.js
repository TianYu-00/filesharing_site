const express = require("express");
const authController = require("../mvc/controller/auth.controller");
const userTokenChecker = require("../src/userTokenChecker");
const forgotPasswordTokenChecker = require("../src/forgotPasswordTokenChecker");
const isLoggedInChecker = require("../src/isLoggedInChecker");
const checkAdminRole = require("../src/checkAdminRole");
const authRouter = express.Router();

// Token Management
authRouter.get(
  "/blacklist-tokens",
  userTokenChecker,
  isLoggedInChecker,
  checkAdminRole,
  authController.fetchAllBlacklistTokens
);
authRouter.get("/verify-user-token", userTokenChecker, isLoggedInChecker, authController.testUserTokens);

// Authentication
authRouter.post("/register", authController.attemptRegister);
authRouter.post("/login", authController.attemptLogin);
authRouter.post("/logout", userTokenChecker, isLoggedInChecker, authController.attemptLogout);

// User Password management
authRouter.post("/forgot-password", authController.sendPasswordResetLink);
authRouter.post("/forgot-password/verify", forgotPasswordTokenChecker, authController.verifyForgotPasswordToken);
authRouter.patch("/reset-password", forgotPasswordTokenChecker, authController.resetPassword);

module.exports = authRouter;
