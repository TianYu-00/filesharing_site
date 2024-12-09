const apisRouter = require("express").Router();
const controller_apis = require("../mvc/controller/api.controller");
const fileRouter = require("./file-router");
const userRouter = require("./user-router");
const authRouter = require("./auth-router");

//
apisRouter.get("/", controller_apis.getApis);

// Routes
apisRouter.use("/files", fileRouter);
apisRouter.use("/users", userRouter);
apisRouter.use("/auth", authRouter);

module.exports = apisRouter;
