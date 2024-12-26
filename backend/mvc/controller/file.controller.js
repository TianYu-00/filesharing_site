const {
  uploadFile,
  retrieveFileInfo,
  retrieveFile,
  retrieveDownloadLinks,
  deleteFile,
  retrieveAllFilesInfo,
  retrieveFileInfoByLink,
  updateFileNameById,
  createDownloadLink,
  deleteDownloadLink,
  retrieveFileInfoByDownloadLinkId,
  retrieveDownloadLinkInfo,
  patchDownloadLinkLimitCount,
  validateDownloadPassword,
  deleteManyFilesByFileIds,
  favouriteFileByFileId,
  trashFileByFileId,
  validateDownloadLinkAndPassword,
  checkAllFilesBelongToUser,
  updateManyTrashFilesByFilesAndTrashState,
  retrievePreviewFile,
} = require("../models/file.model");
const jwt = require("jsonwebtoken");

// Admin
exports.getAllFilesInfo = async (req, res, next) => {
  try {
    const files = await retrieveAllFilesInfo();
    res.json({ success: true, msg: "Files data has been fetched", data: files });
  } catch (err) {
    next(err);
  }
};

// All
exports.postFile = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    req.userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_USER_ACCESS_TOKEN_SECRET);
        req.userId = decoded.userData?.id;
      } catch (err) {
        return res.status(401).json({ success: false, msg: "Invalid or expired token", data: null });
      }
    }

    const { file, fileId, downloadLink } = await uploadFile(req);

    res.json({ success: true, msg: "File has been uploaded", data: { file, downloadLink } });
  } catch (err) {
    next(err);
  }
};

// Admin
exports.getFileInfo = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const file = await retrieveFileInfo(file_id);
    res.json({ success: true, msg: "File data has been fetched", data: file });
  } catch (err) {
    next(err);
  }
};

// User / Link&Password
exports.getFile = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const fileInfo = await retrieveFileInfo(file_id);
    const loggedInUserId = req.userData?.id;

    if (fileInfo.user_id === loggedInUserId) {
      return await retrieveFile(file_id, res);
    }

    const { link, password } = req.query;

    if (!link) {
      return res.status(400).json({ success: false, msg: "Access denied" });
    }

    const linkPasswordResult = await validateDownloadLinkAndPassword(link, password);

    if (linkPasswordResult) {
      return await retrieveFile(file_id, res);
    } else {
      return res.status(403).json({ success: false, msg: "Invalid link or password" });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// User
exports.getDownloadLinks = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const fileInfo = await retrieveFileInfo(file_id);

    const loggedInUserId = req.userData.id;

    if (fileInfo.user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const links = await retrieveDownloadLinks(file_id);
    res.json({ success: true, msg: "Download link retrieved", data: links });
  } catch (err) {
    next(err);
  }
};

// User
exports.deleteFile = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const user_id = req.userData.id;

    const file = await retrieveFileInfo(file_id);

    if (file.user_id !== user_id && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied", data: null });
    }

    await deleteFile(file_id);
    res.json({ success: true, msg: "File has been deleted", data: null });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// All
exports.getFileInfoByLink = async (req, res, next) => {
  try {
    const downloadLink = req.params.download_link;
    const fileInfo = await retrieveFileInfoByLink(downloadLink);

    if (!fileInfo) {
      return res.status(404).json({ success: false, msg: "File not found", data: null });
    }

    res.json({ success: true, msg: "File information retrieved", data: fileInfo });
  } catch (err) {
    next(err);
  }
};

// User
exports.renameFileById = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const fileInfo = await retrieveFileInfo(file_id);

    const loggedInUserId = req.userData.id;

    if (fileInfo.user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const { newFileName } = req.body;
    const data = await updateFileNameById(fileInfo, newFileName);

    res.json({ success: true, msg: "Files changed successfully", data: data });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// User
exports.createDownloadLinkByFileId = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const fileInfo = await retrieveFileInfo(file_id);

    const loggedInUserId = req.userData.id;

    if (fileInfo.user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const { expires_at = null, password = null, download_limit = null } = req.body;
    const data = await createDownloadLink(file_id, expires_at, password, download_limit);
    res.json({ success: true, msg: "Download link created successfully", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// User
exports.removeDownloadLinkByLinkId = async (req, res, next) => {
  try {
    const link_id = req.params.link_id;

    const { user_id } = await retrieveFileInfoByDownloadLinkId(link_id);

    const loggedInUserId = req.userData.id;

    if (user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const data = await deleteDownloadLink(link_id);
    res.json({ success: true, msg: "Download link has been deleted", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// All
exports.getDownloadLinkInfoByDownloadLink = async (req, res, next) => {
  try {
    const downloadLink = req.params.download_link;
    const linkInfo = await retrieveDownloadLinkInfo(downloadLink);

    if (!linkInfo) {
      return res.status(404).json({ success: false, msg: "Download link not found" });
    }

    res.json({ success: true, msg: "Download link info has been fetched", data: linkInfo });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// All
exports.updateDownloadLinkCount = async (req, res, next) => {
  try {
    const link_id = req.params.link_id;
    const data = await patchDownloadLinkLimitCount(link_id);
    res.json({ success: true, msg: "Download link counter increased", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// All
exports.validateDownloadLinkPassword = async (req, res, next) => {
  try {
    const link_id = req.params.link_id;
    const { password } = req.body;
    const data = await validateDownloadPassword(link_id, password);

    res.json({ success: true, msg: "Password validated successfully", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// User
exports.removeManyFilesByFileInfo = async (req, res, next) => {
  try {
    const { files } = req.body;
    const loggedInUserId = req.userData.id;
    const checkResult = await checkAllFilesBelongToUser(files, loggedInUserId);

    if (!checkResult) {
      res.json({ success: false, msg: "Access denied", data: null });
    }

    const data = await deleteManyFilesByFileIds(files);

    res.json({ success: true, msg: "Files has been deleted", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// User
exports.favouriteFileById = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const fileInfo = await retrieveFileInfo(file_id);

    const loggedInUserId = req.userData.id;

    if (fileInfo.user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const { favourite } = req.body;
    if (favourite === undefined) {
      return res.status(404).json({ success: false, msg: "Missing favourite body state", data: null });
    }
    const data = await favouriteFileByFileId(file_id, favourite);

    res.json({ success: true, msg: "File has been updated successfully", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// User
exports.trashFileById = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const fileInfo = await retrieveFileInfo(file_id);

    const loggedInUserId = req.userData.id;

    if (fileInfo.user_id !== loggedInUserId && req.userData.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const { trash } = req.body;
    if (trash === undefined) {
      return res.status(404).json({ success: false, msg: "Missing trash body state", data: null });
    }
    const data = await trashFileByFileId(file_id, trash);

    res.json({ success: true, msg: "File has been updated successfully", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// User
exports.trashManyFileById = async (req, res, next) => {
  try {
    const { files, trash } = req.body;
    const loggedInUserId = req.userData.id;
    const checkResult = await checkAllFilesBelongToUser(files, loggedInUserId);

    if (!checkResult) {
      res.json({ success: false, msg: "Access denied", data: null });
    }

    const data = await updateManyTrashFilesByFilesAndTrashState(files, trash);

    res.json({ success: true, msg: "Files has been trashed", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.previewFileById = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const fileInfo = await retrieveFileInfo(file_id);
    const loggedInUserId = req.userData?.id;

    if (fileInfo.user_id === loggedInUserId) {
      return await retrievePreviewFile(file_id, res);
    }

    const { link, password } = req.query;

    if (!link) {
      return res.status(400).json({ success: false, msg: "Access denied" });
    }

    const linkPasswordResult = await validateDownloadLinkAndPassword(link, password);

    if (linkPasswordResult) {
      return await retrievePreviewFile(file_id, res);
    } else {
      return res.status(403).json({ success: false, msg: "Invalid link or password" });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};
