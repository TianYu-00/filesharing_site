const express = require("express");
const userController = require("../mvc/controller/user.controller");
const userRouter = express.Router();

userRouter.get("/", userController.fetchAllUsers);
userRouter.get("/:user_id", userController.fetchUserById);
userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.patch("/:user_id", userController.editUserById);
userRouter.post("/logout", userController.logoutUser);
userRouter.post("/send-password-reset-link", userController.sendPasswordResetLink);

module.exports = userRouter;
