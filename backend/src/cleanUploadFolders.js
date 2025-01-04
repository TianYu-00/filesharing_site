const fs = require("fs");
const path = require("path");
const { baseUploadDir, testBaseUploadDir } = require("../src/pathHandler");

exports.cleanUploadsFolder = async function () {
  try {
    const files = await fs.promises.readdir(baseUploadDir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(baseUploadDir, file.name);
      if (file.isDirectory()) {
        await fs.promises.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.promises.unlink(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error clearing uploads directory: ${err}`);
  }
};

exports.cleanUploadsTestFolder = async function () {
  try {
    const files = await fs.promises.readdir(testBaseUploadDir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(testBaseUploadDir, file.name);
      if (file.isDirectory()) {
        await fs.promises.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.promises.unlink(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error clearing uploads directory: ${err}`);
  }
};
