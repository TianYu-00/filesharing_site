const express = require("express");
const fileController = require("../mvc/controller/file.controller");
const fileRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const verifyUserAuthToken = require("../src/verifyUserAuthToken");

fileRouter.get("/", fileController.getAllFilesInfo);
fileRouter.post("/upload", fileController.postFile); // used
fileRouter.get("/info/:file_id", fileController.getFileInfo);
fileRouter.get("/download/:file_id", fileController.getFile); // used
fileRouter.delete("/delete/:file_id", verifyUserAuthToken, fileController.deleteFile);
fileRouter.get("/info-by-link/:download_link", fileController.getFileInfoByLink); // used
fileRouter.patch("/rename/:file_id", verifyUserAuthToken, fileController.renameFileById);

fileRouter.get("/download-link/:file_id", fileController.getDownloadLinks);
fileRouter.post("/create-download-link/:file_id", verifyUserAuthToken, fileController.createDownloadLinkByFileId);

module.exports = fileRouter;
