const fs = require("fs/promises");
const endpoints = require("../../endpoints.json");

exports.selectApis = () => {
  return fs.readFile("endpoints.json", "utf-8").then((result) => {
    return JSON.parse(result);
  });
};
