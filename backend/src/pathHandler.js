const path = require("path");

const baseUploadDir = path.join(__dirname, "..", "uploads");
const testBaseUploadDir = path.join(__dirname, "..", "uploads_test");
const fileNameSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

fetchFullUploadPath = (user_path) => {
  let basePath;
  if (process.env.NODE_ENV === "test") {
    basePath = testBaseUploadDir;
  } else {
    basePath = baseUploadDir;
  }

  return path.join(basePath, user_path);
};

createRelativePath = (user_path) => {
  let basePath;
  if (process.env.NODE_ENV === "test") {
    basePath = testBaseUploadDir;
  } else {
    basePath = baseUploadDir;
  }

  return "/" + path.relative(basePath, user_path);
};

createFileNameWithSuffix = (file_name) => {
  return fileNameSuffix + "-" + file_name;
};

module.exports = {
  baseUploadDir,
  testBaseUploadDir,
  fetchFullUploadPath,
  createRelativePath,
  createFileNameWithSuffix,
};
