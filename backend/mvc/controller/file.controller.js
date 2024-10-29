const {
  uploadFile,
  retrieveFileInfo,
  retrieveFile,
  retrieveDownloadLinks,
  deleteFile,
} = require("../models/file.model");

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
    res.status(400).json({ success: false, msg: err.message, data: null });
  }
};

// For /download/:file_id
exports.getFile = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    await retrieveFile(file_id, res);
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message, data: null });
  }
};

// For /download-link/:file_id
exports.getDownloadLinks = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    const links = await retrieveDownloadLinks(file_id);
    res.json({ success: true, msg: "Download link retrieved", data: links });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message, data: null });
  }
};

// For /delete/:file_id
exports.deleteFile = async (req, res, next) => {
  try {
    const file_id = req.params.file_id;
    await deleteFile(file_id);
    res.json({ success: true, msg: "File has been deleted", data: null });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message, data: null });
  }
};
