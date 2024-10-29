const { uploadFile } = require("../models/file.model");

exports.postFile = async (req, res, next) => {
  try {
    const file = await uploadFile(req);
    res.json({ success: true, msg: "File has been uploaded", data: file });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message, data: null });
  }
};
