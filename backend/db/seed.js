const db = require("./connection");
const format = require("pg-format");
const fs = require("fs");
const path = require("path");

async function createTables({ users }) {
  try {
    await cleanUploadsFolder();

    await db.query("DROP TABLE IF EXISTS file_download_link CASCADE;");
    await db.query("DROP TABLE IF EXISTS file_info CASCADE;");
    await db.query("DROP TABLE IF EXISTS users CASCADE;");

    await createUsersTable();
    await createFileInfoTable();
    await createFileDownloadLinksTable();

    await insertUsers(users);

    console.log("Tables successfully seeded.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}

async function createUsersTable() {
  await db.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      role VARCHAR(50) DEFAULT 'user' NOT NULL
    );
  `);
}

async function createFileInfoTable() {
  await db.query(`
    CREATE TABLE file_info (
      id SERIAL PRIMARY KEY,
      fieldname VARCHAR(255),
      originalname VARCHAR(255),
      encoding VARCHAR(50),
      mimetype VARCHAR(50),
      destination TEXT,
      filename VARCHAR(255),
      path TEXT,
      size INTEGER,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function createFileDownloadLinksTable() {
  await db.query(`
    CREATE TABLE file_download_link (
      id SERIAL PRIMARY KEY,
      file_id INTEGER REFERENCES file_info(id) ON DELETE CASCADE,
      download_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      password VARCHAR(255),
      download_count INTEGER DEFAULT 0,
      download_limit INTEGER DEFAULT NULL
    );
  `);
}

async function cleanUploadsFolder() {
  const uploadsDir = path.join(__dirname, "../uploads");
  try {
    const files = await fs.promises.readdir(uploadsDir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(uploadsDir, file.name);
      if (file.isDirectory()) {
        await fs.promises.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.promises.unlink(fullPath);
      }
    }
    console.log("Uploads directory cleared.");
  } catch (err) {
    console.error(`Error clearing uploads directory: ${err}`);
  }
}

async function insertUsers(users) {
  const query = format(
    `INSERT INTO users (username, email, password) VALUES %L`,
    users.map((user) => [user.username, user.email, user.password])
  );

  await db.query(query);
}

module.exports = createTables;
