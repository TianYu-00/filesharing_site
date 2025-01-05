const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { baseUploadDir, testBaseUploadDir, createFileNameWithSuffix } = require("../src/pathHandler");

const checkUploadDirExist = (dir = baseUploadDir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const multerStorageConfig = () => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      if (process.env.NODE_ENV === "test") {
        uploadDir = testBaseUploadDir;
      } else {
        uploadDir = baseUploadDir;
      }

      if (req.userId) {
        if (process.env.NODE_ENV === "test") {
          uploadDir = path.join(testBaseUploadDir, String(req.userId));
        } else {
          uploadDir = path.join(baseUploadDir, String(req.userId));
        }
      } else {
        if (process.env.NODE_ENV === "test") {
          uploadDir = path.join(testBaseUploadDir, "guests");
        } else {
          uploadDir = path.join(baseUploadDir, "guests");
        }
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
