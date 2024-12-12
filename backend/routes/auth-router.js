const express = require("express");
const authController = require("../mvc/controller/auth.controller");
const userTokenChecker = require("../src/userTokenChecker");
const forgotPasswordTokenChecker = require("../src/forgotPasswordTokenChecker");
const isLoggedInChecker = require("../src/isLoggedInChecker");
const authRouter = express.Router();

authRouter.get("/", authController.fetchAllBlacklistTokens);
authRouter.get("/test", userTokenChecker, isLoggedInChecker, authController.testUserTokens);
authRouter.post(
  "/test-forgot-password-token",
  forgotPasswordTokenChecker,
  isLoggedInChecker,
  authController.verifyForgotPasswordToken
);

authRouter.post("/register", authController.attemptRegister);
authRouter.post("/login", authController.attemptLogin);
authRouter.post("/logout", authController.attemptLogout);

authRouter.post("/forgot-password", authController.sendPasswordResetLink);
authRouter.patch("/reset-password", forgotPasswordTokenChecker, isLoggedInChecker, authController.resetPassword);

module.exports = authRouter;

// NOTE:
// register/login/logout would be removed from users and be placed here instead
