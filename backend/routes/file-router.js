const express = require("express");
const fileController = require("../mvc/controller/file.controller");
const fileRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const userTokenChecker = require("../src/userTokenChecker");
const isLoggedInChecker = require("../src/isLoggedInChecker");

// Admin only
fileRouter.get("/", userTokenChecker, isLoggedInChecker, checkAdminRole, fileController.getAllFilesInfo); // tested
fileRouter.get("/:file_id/info", userTokenChecker, isLoggedInChecker, checkAdminRole, fileController.getFileInfo); // tested

// Protected routes
fileRouter.delete("/:file_id", userTokenChecker, isLoggedInChecker, fileController.deleteFile);
fileRouter.patch("/:file_id/rename", userTokenChecker, isLoggedInChecker, fileController.renameFileById);
fileRouter.get("/:file_id/download-links", userTokenChecker, isLoggedInChecker, fileController.getDownloadLinks); // tested
fileRouter.post(
  "/:file_id/download-link",
  userTokenChecker,
  isLoggedInChecker,
  fileController.createDownloadLinkByFileId
); // tested
fileRouter.delete(
  "/download-links/:link_id",
  userTokenChecker,
  isLoggedInChecker,
  fileController.removeDownloadLinkByLinkId
); // tested
fileRouter.get("/:file_id/preview", userTokenChecker, fileController.previewFileById);
fileRouter.patch("/:file_id/favourite", userTokenChecker, isLoggedInChecker, fileController.favouriteFileById);
fileRouter.patch("/:file_id/trash", userTokenChecker, isLoggedInChecker, fileController.trashFileById);
fileRouter.get("/:file_id/download", userTokenChecker, fileController.getFile); //tested
fileRouter.patch("/trash-many/files", userTokenChecker, isLoggedInChecker, fileController.trashManyFileById);
fileRouter.delete("/delete-many/files", userTokenChecker, isLoggedInChecker, fileController.removeManyFilesByFileInfo);

// Public routes
fileRouter.post("/upload", fileController.postFile); // tested
fileRouter.get("/download-links/:download_link/file-info", fileController.getFileInfoByLink); // tested
fileRouter.get("/download-links/:download_link/details", fileController.getDownloadLinkInfoByDownloadLink); // tested
fileRouter.patch("/download-links/:link_id/increase-download-count", fileController.updateDownloadLinkCount); // tested
fileRouter.post("/download-links/:link_id/validate-password", fileController.validateDownloadLinkPassword); // tested

module.exports = fileRouter;
