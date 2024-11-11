const {
  uploadFile,
  retrieveFileInfo,
  retrieveFile,
  retrieveDownloadLinks,
  deleteFile,
  retrieveAllFilesInfo,
  retrieveFileInfoByLink,
} = require("../models/file.model");

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
    await deleteFile(file_id);
    res.json({ success: true, msg: "File has been deleted", data: null });
  } catch (err) {
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
