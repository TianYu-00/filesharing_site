const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { baseUploadDir, createFileNameWithSuffix } = require("../src/pathHandler");

const checkUploadDirExist = (dir = baseUploadDir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const multerStorageConfig = () => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir = baseUploadDir;

      if (req.userId) {
        uploadDir = path.join(baseUploadDir, String(req.userId));
      } else {
        uploadDir = path.join(baseUploadDir, "guests");
      }
      checkUploadDirExist(uploadDir);
      cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
      const newFileName = createFileNameWithSuffix(file.originalname);
      cb(null, newFileName);
    },
  });
};

const upload = multer({ storage: multerStorageConfig() });

module.exports = { upload, checkUploadDirExist };
