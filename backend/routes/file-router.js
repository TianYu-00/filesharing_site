const express = require("express");
const fileController = require("../mvc/controller/file.controller");
const fileRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const userTokenChecker = require("../src/userTokenChecker");
const isLoggedInChecker = require("../src/isLoggedInChecker");

// admin only
fileRouter.get("/", userTokenChecker, isLoggedInChecker, checkAdminRole, fileController.getAllFilesInfo);
fileRouter.get("/info/:file_id", userTokenChecker, isLoggedInChecker, checkAdminRole, fileController.getFileInfo);

// should be protected
fileRouter.delete("/delete-file-by-file-id/:file_id", userTokenChecker, isLoggedInChecker, fileController.deleteFile);
fileRouter.patch(
  "/rename-file-by-file-id/:file_id",
  userTokenChecker,
  isLoggedInChecker,
  fileController.renameFileById
);
fileRouter.get(
  "/download-link-by-file-id/:file_id",
  userTokenChecker,
  isLoggedInChecker,
  fileController.getDownloadLinks
);
fileRouter.post(
  "/create-download-link-by-file-id/:file_id",
  userTokenChecker,
  isLoggedInChecker,
  fileController.createDownloadLinkByFileId
);
fileRouter.delete(
  "/remove-download-link-by-link-id/:link_id",
  userTokenChecker,
  isLoggedInChecker,
  fileController.removeDownloadLinkByLinkId
);

fileRouter.delete(
  "/remove-many-files-by-body-file-info",
  userTokenChecker,
  isLoggedInChecker,
  fileController.removeManyFilesByFileInfo
);

fileRouter.patch(
  "/update-favourite-file-by-file-id/:file_id",
  userTokenChecker,
  isLoggedInChecker,
  fileController.favouriteFileById
);

fileRouter.patch(
  "/update-trash-file-by-file-id/:file_id",
  userTokenChecker,
  isLoggedInChecker,
  fileController.trashFileById
);

fileRouter.get("/download-file-by-id/:file_id", userTokenChecker, fileController.getFile);

// new
fileRouter.patch("/update-many-trash-file", userTokenChecker, isLoggedInChecker, fileController.trashManyFileById);
fileRouter.get("/preview-file/:file_id", userTokenChecker, fileController.previewFileById);

// for all
fileRouter.post("/file-upload", fileController.postFile);
fileRouter.get("/file-info-by-link/:download_link", fileController.getFileInfoByLink);
fileRouter.get("/download-link-info-by-link/:download_link", fileController.getDownloadLinkInfoByDownloadLink);
fileRouter.patch("/increase-download-count-by-link-id/:link_id", fileController.updateDownloadLinkCount);
fileRouter.post("/validate-download-password-by-link-id/:link_id", fileController.validateDownloadLinkPassword);

module.exports = fileRouter;
