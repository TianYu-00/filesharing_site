const express = require("express");
const fileController = require("../mvc/controller/file.controller");
const fileRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const userTokenChecker = require("../src/userTokenChecker");
const isLoggedInChecker = require("../src/isLoggedInChecker");

fileRouter.get("/", userTokenChecker, isLoggedInChecker, checkAdminRole, fileController.getAllFilesInfo);
fileRouter.get("/:file_id/info", userTokenChecker, isLoggedInChecker, checkAdminRole, fileController.getFileInfo);

fileRouter.delete("/:file_id", userTokenChecker, isLoggedInChecker, fileController.deleteFile);
fileRouter.patch("/:file_id/rename", userTokenChecker, isLoggedInChecker, fileController.renameFileById);
fileRouter.get("/:file_id/download-links", userTokenChecker, isLoggedInChecker, fileController.getDownloadLinks);
fileRouter.post(
  "/:file_id/download-link",
  userTokenChecker,
  isLoggedInChecker,
  fileController.createDownloadLinkByFileId
);
fileRouter.delete(
  "/download-links/:link_id",
  userTokenChecker,
  isLoggedInChecker,
  fileController.removeDownloadLinkByLinkId
);
fileRouter.get("/:file_id/preview", userTokenChecker, fileController.previewFileById);
fileRouter.patch("/:file_id/favourite", userTokenChecker, isLoggedInChecker, fileController.favouriteFileById);
fileRouter.patch("/:file_id/trash", userTokenChecker, isLoggedInChecker, fileController.trashFileById);
fileRouter.get("/:file_id/download", userTokenChecker, fileController.getFile);
fileRouter.patch("/trash-many/files", userTokenChecker, isLoggedInChecker, fileController.trashManyFileById);
fileRouter.delete("/delete-many/files", userTokenChecker, isLoggedInChecker, fileController.removeManyFilesByFileInfo);

fileRouter.post("/upload", fileController.postFile);
fileRouter.get("/download-links/:download_link/file-info", fileController.getFileInfoByLink);
fileRouter.get("/download-links/:download_link/details", fileController.getDownloadLinkInfoByDownloadLink);
fileRouter.patch("/download-links/:link_id/increase-download-count", fileController.updateDownloadLinkCount);
fileRouter.post("/download-links/:link_id/validate-password", fileController.validateDownloadLinkPassword);

module.exports = fileRouter;
