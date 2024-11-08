const db = require("./connection");

function createTables() {
  return db
    .query("DROP TABLE IF EXISTS file_download_link;")
    .then(() => db.query("DROP TABLE IF EXISTS file_info;"))
    .then(() => db.query("DROP TABLE IF EXISTS users;"))
    .then(() => createUsersTable())
    .then(() => createFileInfoTable())
    .then(() => createFileDownloadLinksTable())
    .catch((err) => {
      console.error("Error creating tables:", err);
    });
}

function createUsersTable() {
  return db.query(`CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`);
}

function createFileInfoTable() {
  return db.query(`CREATE TABLE file_info (
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
  );`);
}

function createFileDownloadLinksTable() {
  return db.query(`CREATE TABLE file_download_link (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES file_info(id) ON DELETE CASCADE,
    download_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    password VARCHAR(255)
  );`);
}

module.exports = createTables;
