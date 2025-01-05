const db = require("./connection");
const format = require("pg-format");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const {
  baseUploadDir,
  testBaseUploadDir,
  createRelativePath,
  createFileNameWithSuffix,
} = require("../src/pathHandler");

async function createTables({ users }) {
  try {
    await cleanUploadsFolder();
    await cleanUploadsTestFolder();

    await db.query("DROP TABLE IF EXISTS blacklisted_tokens CASCADE;");
    await db.query("DROP TABLE IF EXISTS file_download_link CASCADE;");
    await db.query("DROP TABLE IF EXISTS file_info CASCADE;");
    await db.query("DROP TABLE IF EXISTS users CASCADE;");

    await createUsersTable();
    await createFileInfoTable();
    await createFileDownloadLinksTable();
    await createTokenBlacklistTable();

    await insertUsers(users);
    await insertFiles(1);

    // console.log("Tables successfully seeded.");
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
      encoding VARCHAR(255),
      mimetype VARCHAR(255),
      destination TEXT,
      filename VARCHAR(255),
      path TEXT,
      size INTEGER,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      favourite BOOLEAN DEFAULT FALSE NOT NULL,
      trash BOOLEAN DEFAULT FALSE NOT NULL
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

async function createTokenBlacklistTable() {
  await db.query(`
    CREATE TABLE blacklisted_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      jti VARCHAR(255) NOT NULL,
      token_type VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function cleanUploadsFolder() {
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
}

async function cleanUploadsTestFolder() {
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
}

async function insertUsers(users) {
  const usersWithHashedPasswords = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return [user.username, user.email, hashedPassword, user.role];
    })
  );

  const query = format(`INSERT INTO users (username, email, password, role) VALUES %L`, usersWithHashedPasswords);

  await db.query(query);
}

async function insertFiles(userId = null) {
  const seedFilesDir = path.join(__dirname, "test_data", "test_files");
  const userDir = userId ? `${userId}` : "guest";
  const testUploadsDir = path.join(testBaseUploadDir, userDir);

  try {
    await fs.promises.mkdir(testUploadsDir, { recursive: true });

    const files = await fs.promises.readdir(seedFilesDir, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile()) continue;

      const fileName = createFileNameWithSuffix(file.name);
      const sourcePath = path.join(seedFilesDir, file.name);
      const destinationPath = path.join(testUploadsDir, fileName);

      await fs.promises.copyFile(sourcePath, destinationPath);

      const stats = await fs.promises.stat(destinationPath);
      const filteredDestination = createRelativePath(testUploadsDir);
      const filteredPath = createRelativePath(destinationPath);

      const fileInfo = {
        fieldname: "file",
        originalname: file.name,
        encoding: "7bit",
        mimetype: "application/octet-stream",
        destination: filteredDestination,
        filename: fileName,
        path: filteredPath,
        size: stats.size,
        user_id: userId,
      };

      await db.query(
        `
          INSERT INTO file_info (fieldname, originalname, encoding, mimetype, destination, filename, path, size, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          fileInfo.fieldname,
          fileInfo.originalname,
          fileInfo.encoding,
          fileInfo.mimetype,
          fileInfo.destination,
          fileInfo.filename,
          fileInfo.path,
          fileInfo.size,
          fileInfo.user_id,
        ]
      );
    }
  } catch (err) {
    console.error("Error seeding files:", err);
  }
}

module.exports = createTables;
