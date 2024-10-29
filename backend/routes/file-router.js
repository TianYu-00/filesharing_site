const express = require("express");
const {
  postFile,
  getFileInfo,
  getFile,
  getDownloadLinks,
  deleteFile,
  getAllFilesInfo,
} = require("../mvc/controller/file.controller");

const fileRouter = express.Router();

fileRouter.get("/", getAllFilesInfo);
fileRouter.post("/upload", postFile);
fileRouter.get("/info/:file_id", getFileInfo);
fileRouter.get("/download/:file_id", getFile);
fileRouter.get("/download-link/:file_id", getDownloadLinks);
fileRouter.delete("/delete/:file_id", deleteFile);

module.exports = fileRouter;
