const express = require("express");
const fileController = require("../mvc/controller/file.controller");
const fileRouter = express.Router();

const checkAdminRole = require("../src/checkAdminRole");
const verifyUserAuthToken = require("../src/verifyUserAuthToken");

// admin only
fileRouter.get("/", verifyUserAuthToken, checkAdminRole, fileController.getAllFilesInfo); // not used
fileRouter.get("/info/:file_id", verifyUserAuthToken, checkAdminRole, fileController.getFileInfo); // not used

// should be protected
fileRouter.delete("/delete-file-by-file-id/:file_id", verifyUserAuthToken, fileController.deleteFile);
fileRouter.patch("/rename-file-by-file-id/:file_id", verifyUserAuthToken, fileController.renameFileById);
fileRouter.get("/download-link-by-file-id/:file_id", verifyUserAuthToken, fileController.getDownloadLinks);
fileRouter.post(
  "/create-download-link-by-file-id/:file_id",
  verifyUserAuthToken,
  fileController.createDownloadLinkByFileId
);
fileRouter.delete(
  "/remove-download-link-by-link-id/:link_id",
  verifyUserAuthToken,
  fileController.removeDownloadLinkByLinkId
);

// for all
fileRouter.post("/file-upload", fileController.postFile);
fileRouter.get("/download-file-by-id/:file_id", fileController.getFile);
fileRouter.get("/file-info-by-link/:download_link", fileController.getFileInfoByLink);
fileRouter.get("/download-link-info-by-link/:download_link", fileController.getDownloadLinkInfoByDownloadLink);
fileRouter.patch("/increase-download-count-by-link-id/:link_id", fileController.updateDownloadLinkCount);
fileRouter.post("/validate-download-password-by-link-id/:link_id", fileController.validateDownloadLinkPassword);

module.exports = fileRouter;
