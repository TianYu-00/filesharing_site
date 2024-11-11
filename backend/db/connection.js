const { Pool } = require("pg");
const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

// console.log("Connected to database:", process.env.PGDATABASE || process.env.DATABASE_URL);

const config = {};
if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 10;
}

module.exports = new Pool(config);
