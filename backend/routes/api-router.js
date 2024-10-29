const apisRouter = require("express").Router();
const controller_apis = require("../mvc/controller/api.controller");
const fileRouter = require("./file-router");

//
apisRouter.get("/", controller_apis.getApis);

// Routes
apisRouter.use("/files", fileRouter);

module.exports = apisRouter;
