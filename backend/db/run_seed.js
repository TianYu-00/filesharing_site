const createTables = require("./seed");
const db = require("./connection");
const devData = require("./test_data/test_index");

const runCreateTables = async () => {
  try {
    await createTables(devData);
    console.log("Tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    db.end();
  }
};

runCreateTables();
