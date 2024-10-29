const express = require("express");
const { postFile } = require("../mvc/controller/file.controller");

const fileRouter = express.Router();

fileRouter.post("/upload", postFile);

module.exports = fileRouter;
