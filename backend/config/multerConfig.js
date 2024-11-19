const multer = require("multer");
const fs = require("fs");
const path = require("path");

const baseUploadDir = path.join(__dirname, "..", "uploads");

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
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });
};

const upload = multer({ storage: multerStorageConfig() });

module.exports = { upload, checkUploadDirExist };
