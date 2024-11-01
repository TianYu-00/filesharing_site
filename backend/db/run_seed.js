const createTables = require("./seed");
const db = require("./connection");

const runCreateTables = async () => {
  try {
    await createTables();
    console.log("Tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    db.end();
  }
};

runCreateTables();
