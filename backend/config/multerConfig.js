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
      req.on("aborted", () => {
        let uploadDir;
        if (process.env.NODE_ENV === "test") {
          uploadDir = testBaseUploadDir;
        } else {
          uploadDir = baseUploadDir;
        }

        if (req.userId) {
          if (process.env.NODE_ENV === "test") {
            uploadDir = path.join(testBaseUploadDir, String(req.userId), newFileName);
          } else {
            uploadDir = path.join(baseUploadDir, String(req.userId), newFileName);
          }
        } else {
          if (process.env.NODE_ENV === "test") {
            uploadDir = path.join(testBaseUploadDir, "guests", newFileName);
          } else {
            uploadDir = path.join(baseUploadDir, "guests", newFileName);
          }
        }
        file.stream.on("end", () => {
          fs.unlink(uploadDir, (err) => {
            // console.log(uploadDir);
            if (err) {
              throw err;
            }
          });
        });
        file.stream.emit("end");
      });
    },
  });
};

const fileSizeLimit = process.env.NODE_ENV === "production" ? 1 * 1024 * 1024 : 10 * 1024 * 1024;

const upload = multer({ storage: multerStorageConfig(), limits: { fileSize: fileSizeLimit } });

module.exports = { upload, checkUploadDirExist, fileSizeLimit };
