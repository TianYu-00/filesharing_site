exports.app = require("./app");
exports.db = require("./db/connection");
exports.request = require("supertest");
exports.seed = require("./db/seed");
exports.data = require("./db/test_data/test_index");
exports.cleanupFolder = require("./src/cleanUploadFolders");
