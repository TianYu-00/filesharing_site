const { upload, checkUploadDirExist } = require("../../config/multerConfig");
const db = require("../../db/connection");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// File upload logic
exports.uploadFile = async (req) => {
  checkUploadDirExist();
  return new Promise((resolve, reject) => {
    upload.single("file")(req, {}, async (err) => {
      if (err) {
        return reject(err);
      }
      if (!req.file) {
        return reject(new Error("No file uploaded"));
      }

      const { fieldname, originalname, encoding, mimetype, destination, filename, path: filePath, size } = req.file;
      const userId = req.user ? req.user.id : null;

      try {
        const result = await db.query(
          `
                    INSERT INTO file_info (fieldname, originalname, encoding, mimetype, destination, filename, path, size, user_id) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                    RETURNING id
                `,
          [fieldname, originalname, encoding, mimetype, destination, filename, filePath, size, userId]
        );

        const fileId = result.rows[0].id;

        const downloadLink = await createDownloadLink(fileId);

        resolve({ file: req.file, fileId, downloadLink });
      } catch (dbError) {
        reject(new Error(dbError.message));
      }
    });
  });
};

// File create download link logic
createDownloadLink = async (file_id) => {
  const downloadUrl = uuidv4() + "-id-" + file_id;

  try {
    const result = await db.query(
      `
            INSERT INTO file_download_link (file_id, download_url) 
            VALUES ($1, $2) 
            RETURNING id, download_url
            `,
      [file_id, downloadUrl]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

// File get info logic
exports.retrieveFileInfo = async (file_id) => {
  try {
    const result = await db.query(`SELECT * FROM file_info WHERE id = $1`, [file_id]);

    if (result.rows.length === 0) {
      throw new Error("File not found");
    }

    return result.rows[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

// File get file logic
exports.retrieveFile = async (file_id, res) => {
  try {
    const file = await exports.retrieveFileInfo(file_id);
    const filePath = path.join(file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, msg: "File not found", data: null });
    }

    res.download(filePath, file.originalname, (err) => {
      if (err) {
        res.status(500).json({ success: false, msg: "Error downloading file", data: null });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message, data: null });
  }
};

// File get download link logic
exports.retrieveDownloadLinks = async (file_id) => {
  try {
    const result = await db.query(`SELECT * FROM file_download_link WHERE file_id = $1`, [file_id]);
    return result.rows;
  } catch (err) {
    throw new Error(err.message);
  }
};

// File delete logic
exports.deleteFile = async (file_id) => {
  try {
    const fileInfo = await exports.retrieveFileInfo(file_id);
    const filePath = path.join(fileInfo.path);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      throw new Error("File not found");
    }

    await db.query(`DELETE FROM file_info WHERE id = $1`, [file_id]);
    await db.query(`DELETE FROM file_download_link WHERE file_id = $1`, [file_id]);
  } catch (err) {
    throw new Error(err.message);
  }
};
