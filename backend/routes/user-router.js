const express = require("express");
const userController = require("../mvc/controller/user.controller");
const userRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const userTokenChecker = require("../src/userTokenChecker");
const isLoggedInChecker = require("../src/isLoggedInChecker");

// Admin only
userRouter.get("/", userTokenChecker, isLoggedInChecker, checkAdminRole, userController.fetchAllUsers);

// Protected routes
userRouter.get("/:user_id", userTokenChecker, isLoggedInChecker, userController.fetchUserById);
userRouter.patch("/:user_id", userTokenChecker, isLoggedInChecker, userController.editUserById);
userRouter.get("/:user_id/files", userTokenChecker, isLoggedInChecker, userController.fetchAllFilesBelongToUserId);

module.exports = userRouter;
