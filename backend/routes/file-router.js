const express = require("express");
const fileController = require("../mvc/controller/file.controller");
const fileRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const verifyUserAuthToken = require("../src/verifyUserAuthToken");

fileRouter.get("/", fileController.getAllFilesInfo);
fileRouter.post("/upload", fileController.postFile);
fileRouter.get("/info/:file_id", fileController.getFileInfo);
fileRouter.get("/download/:file_id", fileController.getFile);
fileRouter.delete("/delete/:file_id", verifyUserAuthToken, fileController.deleteFile);
fileRouter.get("/info-by-link/:download_link", fileController.getFileInfoByLink);
fileRouter.patch("/rename/:file_id", verifyUserAuthToken, fileController.renameFileById);

fileRouter.get("/download-link/:file_id", fileController.getDownloadLinks);
fileRouter.post("/create-download-link/:file_id", verifyUserAuthToken, fileController.createDownloadLinkByFileId);
fileRouter.delete("/remove-download-link/:link_id", verifyUserAuthToken, fileController.removeDownloadLinkByLinkId);

fileRouter.get("/download-link-info/:download_link", fileController.getDownloadLinkInfoByDownloadLink);
fileRouter.patch("/increase-download-count/:link_id", fileController.updateDownloadLinkCount);
fileRouter.post("/validate-download-password/:link_id", fileController.validateDownloadLinkPassword);

module.exports = fileRouter;
