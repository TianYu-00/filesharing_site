const express = require("express");
const {
  postFile,
  getFileInfo,
  getFile,
  getDownloadLinks,
  deleteFile,
  getAllFilesInfo,
  getFileInfoByLink,
  renameFileById,
} = require("../mvc/controller/file.controller");
const fileRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const verifyUserAuthToken = require("../src/verifyUserAuthToken");

fileRouter.get("/", getAllFilesInfo);
fileRouter.post("/upload", postFile); // used
fileRouter.get("/info/:file_id", getFileInfo);
fileRouter.get("/download/:file_id", getFile); // used
// fileRouter.get("/download-link/:file_id", getDownloadLinks);
fileRouter.delete("/delete/:file_id", verifyUserAuthToken, deleteFile);
fileRouter.get("/info-by-link/:download_link", getFileInfoByLink); // used
fileRouter.patch("/rename/:file_id", verifyUserAuthToken, renameFileById);

module.exports = fileRouter;
