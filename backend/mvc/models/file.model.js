const { upload, checkUploadDirExist } = require("../../config/multerConfig");

exports.uploadFile = async (req) => {
  checkUploadDirExist();
  return new Promise((resolve, reject) => {
    upload.single("file")(req, {}, (err) => {
      if (err) {
        return reject(err);
      }
      if (!req.file) {
        return reject(new Error("No file uploaded"));
      }
      resolve(req.file);
    });
  });
};
