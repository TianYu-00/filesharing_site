const path = require("path");

const baseUploadDir = path.join(__dirname, "..", "uploads");

fetchFullUploadPath = (user_path) => {
  return path.join(baseUploadDir, user_path);
};

createRelativePath = (user_path) => {
  return "/" + path.relative(baseUploadDir, user_path);
};

module.exports = { baseUploadDir, fetchFullUploadPath, createRelativePath };
