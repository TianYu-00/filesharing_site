const {
  uploadFile,
  retrieveFileInfo,
  retrieveFile,
  retrieveDownloadLinks,
  deleteFile,
  retrieveAllFilesInfo,
  retrieveFileInfoByLink,
} = require("../models/file.model");
const jwt = require("jsonwebtoken");

const checkAdminRole = require("../../src/checkAdminRole");
const verifyUserAuthToken = require("../../src/verifyUserAuthToken");

// For /
exports.getAllFilesInfo = [
  verifyUserAuthToken,
  checkAdminRole,
  async (req, res, next) => {
    try {
      const files = await retrieveAllFilesInfo();
      res.json({ success: true, msg: "Files data has been fetched", data: files });
    } catch (err) {
      next(err);
    }
  },
];

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
exports.deleteFile = [
  verifyUserAuthToken,
  async (req, res, next) => {
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
  },
];

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
