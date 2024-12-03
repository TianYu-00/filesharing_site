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
} = require("../models/file.model");
const jwt = require("jsonwebtoken");

// For /
exports.getAllFilesInfo = async (req, res, next) => {
  try {
    const files = await retrieveAllFilesInfo();
    res.json({ success: true, msg: "Files data has been fetched", data: files });
  } catch (err) {
    next(err);
  }
};

// For /upload
exports.postFile = async (req, res, next) => {
  try {
    const token = req.cookies.userAuthToken;

    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_USER_AUTH_SECRET);

        userId = decoded.userData?.id;
      } catch (err) {
        // console.log(err);
        return res.status(401).json({ success: false, msg: "Invalid or expired token", data: null });
      }
    }
    req.userId = userId;

    const { file, fileId, downloadLink } = await uploadFile(req);

    res.json({ success: true, msg: "File has been uploaded", data: { file, downloadLink } });
  } catch (err) {
    next(err);
  }
};

// for /info/:file_id
exports.getFileInfo = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const file = await retrieveFileInfo(file_id);
    res.json({ success: true, msg: "File data has been fetched", data: file });
  } catch (err) {
    next(err);
  }
};

// For /download/:file_id
exports.getFile = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    await retrieveFile(file_id, res);
  } catch (err) {
    next(err);
  }
};

// For /download-link/:file_id
exports.getDownloadLinks = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const links = await retrieveDownloadLinks(file_id);
    res.json({ success: true, msg: "Download link retrieved", data: links });
  } catch (err) {
    next(err);
  }
};

// For /delete/:file_id
exports.deleteFile = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const user_id = req.userData.id;

    const file = await retrieveFileInfo(file_id);
    // console.log(file_id, user_id);

    if (!file) {
      return res.status(404).json({ success: false, msg: "File not found", data: null });
    }

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

// /info-by-link/:download_link
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

exports.renameFileById = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const fileInfo = await retrieveFileInfo(file_id);

    const loggedInUserId = req.userData.id;
    // console.log(fileInfo, loggedInUserId);

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

const getUserInfoFromCookie = async (req) => {
  const token = req.cookies.userAuthToken;
  const decoded = jwt.verify(token, process.env.JWT_USER_PASSWORD_RESET_SECRET);
  return decoded.userData;
};

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

exports.validateDownloadLinkPassword = async (req, res, next) => {
  try {
    const link_id = req.params.link_id;
    const { password } = req.body;

    // console.log(link_id, password);
    const data = await validateDownloadPassword(link_id, password);

    res.json({ success: true, msg: "Password validated successfully", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.removeManyFilesByFileInfo = async (req, res, next) => {
  try {
    const { files } = req.body;
    // console.log(file_ids);

    const data = await deleteManyFilesByFileIds(files);

    res.json({ success: true, msg: "Files has been deleted", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.favouriteFileById = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
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

exports.trashFileById = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
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
