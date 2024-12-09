const express = require("express");
const fileController = require("../mvc/controller/file.controller");
const fileRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const userTokenChecker = require("../src/userTokenChecker");

// admin only
fileRouter.get("/", userTokenChecker, checkAdminRole, fileController.getAllFilesInfo); // not used
fileRouter.get("/info/:file_id", userTokenChecker, checkAdminRole, fileController.getFileInfo); // not used

// should be protected
fileRouter.delete("/delete-file-by-file-id/:file_id", userTokenChecker, fileController.deleteFile);
fileRouter.patch("/rename-file-by-file-id/:file_id", userTokenChecker, fileController.renameFileById);
fileRouter.get("/download-link-by-file-id/:file_id", userTokenChecker, fileController.getDownloadLinks);
fileRouter.post(
  "/create-download-link-by-file-id/:file_id",
  userTokenChecker,
  fileController.createDownloadLinkByFileId
);
fileRouter.delete(
  "/remove-download-link-by-link-id/:link_id",
  userTokenChecker,
  fileController.removeDownloadLinkByLinkId
);

fileRouter.delete("/remove-many-files-by-body-file-info", userTokenChecker, fileController.removeManyFilesByFileInfo);

fileRouter.patch("/update-favourite-file-by-file-id/:file_id", userTokenChecker, fileController.favouriteFileById);
fileRouter.patch("/update-trash-file-by-file-id/:file_id", userTokenChecker, fileController.trashFileById);

// for all
fileRouter.post("/file-upload", fileController.postFile);
fileRouter.get("/download-file-by-id/:file_id", fileController.getFile);
fileRouter.get("/file-info-by-link/:download_link", fileController.getFileInfoByLink);
fileRouter.get("/download-link-info-by-link/:download_link", fileController.getDownloadLinkInfoByDownloadLink);
fileRouter.patch("/increase-download-count-by-link-id/:link_id", fileController.updateDownloadLinkCount);
fileRouter.post("/validate-download-password-by-link-id/:link_id", fileController.validateDownloadLinkPassword);

module.exports = fileRouter;
