const { upload, checkUploadDirExist, fileSizeLimit } = require("../../config/multerConfig");
const db = require("../../db/connection");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { promisify } = require("util");
const bcrypt = require("bcrypt");
const { baseUploadDir, createRelativePath, fetchFullUploadPath } = require("../../src/pathHandler");
const libre = require("libreoffice-convert");

exports.retrieveAllFilesInfo = async () => {
  try {
    const result = await db.query(`SELECT * FROM file_info;`);
    return result.rows;
  } catch (err) {
    console.error(err);
  }
};

exports.uploadFile = async (req) => {
  checkUploadDirExist();
  return new Promise((resolve, reject) => {
    upload.single("file")(req, {}, async (err) => {
      if (err) {
        // console.log(err);
        if (err.code === "LIMIT_FILE_SIZE") {
          return reject({ code: "FILE_SIZE_LIMIT_EXCEEDED", message: "File size limit exceeded" });
        }
        return reject({ code: "UPLOAD_ERROR", message: "Error uploading file" });
      }
      if (!req.file) {
        return reject({ code: "UPLOAD_ERROR", message: "File was not provided" });
      }

      req.file.destination = createRelativePath(req.file.destination);
      req.file.path = createRelativePath(req.file.path);

      const { fieldname, originalname, encoding, mimetype, destination, filename, path: filePath, size } = req.file;
      const userId = req.userId || null;

      try {
        const result = await db.query(
          `
            INSERT INTO file_info (fieldname, originalname, encoding, mimetype, destination, filename, path, size, user_id, favourite, trash) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *
          ;`,
          [fieldname, originalname, encoding, mimetype, destination, filename, filePath, size, userId, false, false]
        );

        const fileId = result.rows[0].id;
        // const downloadLink = await exports.createDownloadLink(fileId);
        let downloadLink;
        if (userId) {
          downloadLink = await exports.createDownloadLink(fileId);
        } else {
          const tempExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          downloadLink = await exports.createDownloadLink(fileId, tempExpires);
        }

        resolve({ file: result.rows[0], fileId, downloadLink });
      } catch (dbError) {
        console.error(dbError);
      }
    });
  });
};

exports.createDownloadLink = async (file_id, expires_at = null, password = null, download_limit = null) => {
  const downloadUrl = `${file_id}-${Date.now()}-${crypto.randomBytes(16).toString("hex")}`;

  let tempPassword = password;

  if (tempPassword) {
    tempPassword = await bcrypt.hash(password, 10);
  }

  try {
    const result = await db.query(
      `
        INSERT INTO file_download_link (file_id, download_url, expires_at, password, download_limit) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, file_id, download_url, created_at, expires_at, download_count, download_limit
      ;`,
      [file_id, downloadUrl, expires_at, tempPassword, download_limit]
    );
    // console.log(result.rows[0]);
    return result.rows[0];
  } catch (err) {
    // console.log(err);
    console.error(err);
  }
};

exports.retrieveFileInfo = async (file_id) => {
  try {
    const result = await db.query(`SELECT * FROM file_info WHERE id = $1`, [file_id]);

    if (result.rows.length === 0) {
      return Promise.reject({ code: "FILE_NOT_FOUND", message: "File not found" });
    }

    return result.rows[0];
  } catch (err) {
    console.error(err);
  }
};

exports.retrieveFile = async (file_id, res) => {
  try {
    const file = await exports.retrieveFileInfo(file_id);
    const filePath = fetchFullUploadPath(file.path);
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

exports.retrievePreviewFile = async (file_id, res) => {
  try {
    const file = await exports.retrieveFileInfo(file_id);
    const filePath = fetchFullUploadPath(file.path);
    const outputPath = fetchFullUploadPath("preview");
    const pdfFilePath = path.join(outputPath, `${file.filename}.pdf`);

    const pdfFriendlyExtensions = [".docx", ".doc", ".txt", ".ppt", ".pptx"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    if (pdfFriendlyExtensions.includes(fileExtension)) {
      try {
        const ext = ".pdf";
        fs.readFile(filePath, (err, docxBuf) => {
          if (err) {
            console.error("Error reading DOCX file:", err);
            return res.status(500).json({ success: false, msg: "Error reading DOCX file", data: null });
          }

          libre.convert(docxBuf, ext, undefined, (convertErr, pdfBuf) => {
            if (convertErr) {
              console.error("Error during conversion:", convertErr);
              return res.status(500).json({ success: false, msg: "Error converting file", data: null });
            }

            fs.writeFile(pdfFilePath, pdfBuf, (writeErr) => {
              if (writeErr) {
                console.error("Error writing PDF file:", writeErr);
                return res.status(500).json({ success: false, msg: "Error writing PDF file", data: null });
              }

              res.download(pdfFilePath, `${file.filename}.pdf`, (downloadErr) => {
                if (downloadErr) {
                  return res.status(500).json({ success: false, msg: "Error downloading file", data: null });
                }

                fs.unlink(pdfFilePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error(unlinkErr);
                  }
                });
              });
            });
          });
        });
      } catch (error) {
        return res.status(500).json({ success: false, msg: "Error during DOCX processing", data: null });
      }
    } else {
      res.download(filePath, file.originalname, (err) => {
        if (err) {
          return res.status(500).json({ success: false, msg: "Error downloading file", data: null });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message, data: null });
  }
};

exports.retrieveDownloadLinks = async (file_id) => {
  try {
    const result = await db.query(`SELECT * FROM file_download_link WHERE file_id = $1`, [file_id]);
    const filteredResults = result.rows.map((row) => {
      return {
        ...row,
        password: !!row.password,
      };
    });
    return filteredResults;
  } catch (err) {
    console.error(err);
  }
};

exports.deleteFile = async (file_id) => {
  try {
    const fileInfo = await exports.retrieveFileInfo(file_id);
    const filePath = fetchFullUploadPath(fileInfo.path);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      // console.log("found file path");
    } else {
      return Promise.reject({ code: "FILE_NOT_FOUND", message: "File not found" });
    }

    await db.query(`DELETE FROM file_info WHERE id = $1`, [file_id]);
    await db.query(`DELETE FROM file_download_link WHERE file_id = $1`, [file_id]);
  } catch (err) {
    console.error(err);
  }
};

exports.retrieveFileInfoByLink = async (downloadLink) => {
  try {
    const result = await db.query(
      `SELECT file_info.* 
       FROM file_info 
       JOIN file_download_link ON file_info.id = file_download_link.file_id 
       WHERE file_download_link.download_url = $1`,
      [downloadLink]
    );

    if (result.rows.length > 0) {
      const fileInfo = result.rows[0];

      const sanitizedFileInfo = {
        id: fileInfo.id,
        fieldname: fileInfo.fieldname,
        originalname: fileInfo.originalname,
        encoding: fileInfo.encoding,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
        user_id: fileInfo.user_id,
        created_at: fileInfo.created_at,
      };

      return sanitizedFileInfo;
    } else {
      return Promise.reject({ code: "FILE_NOT_FOUND", message: "File not found" });
    }
  } catch (err) {
    console.error(err);
  }
};

exports.updateFileNameById = async (fileInfo, newFileName) => {
  try {
    const rename = promisify(fs.rename);

    const newFileDirName = `${Date.now() + "-" + Math.round(Math.random() * 1e9)}-${newFileName}`;
    const newPath = `${fileInfo.destination}/${newFileDirName}`;

    await rename(fetchFullUploadPath(fileInfo.path), fetchFullUploadPath(newPath));

    const query = `
      UPDATE file_info
      SET originalname = $1, filename = $2, path = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [newFileName, newFileDirName, newPath, fileInfo.id];

    const result = await db.query(query, values);

    return result.rows[0];
  } catch (err) {
    if (err.code === "ENOENT") {
      return Promise.reject({ code: "FILE_NOT_FOUND", message: "File not found on disk." });
    }
    console.error(err);
  }
};

exports.retrieveFileInfoByDownloadLinkId = async (link_id) => {
  try {
    const linkResult = await db.query(`SELECT file_id FROM file_download_link WHERE id = $1`, [link_id]);

    if (linkResult.rows.length === 0) {
      return Promise.reject({ code: "LINK_NOT_FOUND", message: "Download link not found" });
    }

    const file_id = linkResult.rows[0].file_id;

    const fileInfoResult = await db.query(`SELECT * FROM file_info WHERE id = $1`, [file_id]);

    if (fileInfoResult.rows.length === 0) {
      return Promise.reject({ code: "FILE_NOT_FOUND", message: "File not found" });
    }

    return fileInfoResult.rows[0];
  } catch (err) {
    console.error(err);
  }
};

exports.deleteDownloadLink = async (link_id) => {
  try {
    const query = `
      DELETE FROM file_download_link
      WHERE id = $1
      RETURNING *;
    `;
    // console.log(query, link_id);
    const result = await db.query(query, [link_id]);
    return result.rows[0];
  } catch (err) {
    console.error(err);
  }
};

exports.retrieveDownloadLinkInfo = async (downloadLink) => {
  try {
    const query = `SELECT * FROM file_download_link WHERE download_url = $1`;
    const result = await db.query(query, [downloadLink]);

    if (result.rows.length === 0) {
      return Promise.reject({ code: "LINK_NOT_FOUND", message: "Download link not found" });
    }

    const linkInfo = result.rows[0];
    // console.log(linkInfo);

    const formattedLinkInfo = {
      ...linkInfo,
      password: !!linkInfo.password,
    };

    return formattedLinkInfo;
  } catch (err) {
    console.error(err);
  }
};

exports.patchDownloadLinkLimitCount = async (link_id) => {
  try {
    const query = `
      SELECT download_count, download_limit
      FROM file_download_link
      WHERE id = $1;
    `;
    // console.log(link_id);
    const result = await db.query(query, [link_id]);

    if (result.rows.length === 0) {
      return Promise.reject({ code: "LINK_NOT_FOUND", message: "Download link not found" });
    }

    const linkInfo = result.rows[0];
    const currentDownloadCount = linkInfo.download_count;
    const downloadLimit = linkInfo.download_limit;

    if (downloadLimit && currentDownloadCount >= downloadLimit) {
      return Promise.reject({
        code: "LIMIT_EXCEEDED",
        message: `Download limit of ${downloadLimit} has been reached.`,
      });
    }

    const updateQuery = `
      UPDATE file_download_link
      SET download_count = download_count + 1
      WHERE id = $1
      RETURNING *;
    `;
    const updateResult = await db.query(updateQuery, [link_id]);

    const { password, ...sanitizedResult } = updateResult.rows[0];

    return sanitizedResult;
  } catch (err) {
    console.error(err);
  }
};

exports.validateDownloadPassword = async (link_id, enteredPassword) => {
  try {
    const query = `SELECT password FROM file_download_link WHERE id = $1`;
    const result = await db.query(query, [link_id]);

    if (result.rows.length === 0) {
      return Promise.reject({ code: "LINK_NOT_FOUND", message: "Download link not found" });
    }

    if (!result.rows[0].password) {
      return Promise.reject({ code: "PASSWORD_NOT_FOUND", message: "Download link does not have any password" });
    }

    const storedHashedPassword = result.rows[0].password;

    const isPasswordCorrect = await bcrypt.compare(enteredPassword, storedHashedPassword);

    if (!isPasswordCorrect) {
      return Promise.reject({ code: "INCORRECT_PASSWORD", message: "Incorrect password" });
    }

    return { isPasswordCorrect };
  } catch (err) {
    console.error(err);
  }
};

exports.deleteManyFilesByFileIds = async (files) => {
  try {
    const fileIds = files.map((file) => file.id);

    for (const file of files) {
      const filePath = fetchFullUploadPath(file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        // console.warn(`File not found: ${filePath}`);
      }
    }

    const deleteFileInfoResult = await db.query(`DELETE FROM file_info WHERE id = ANY($1)`, [fileIds]);

    const deleteDownloadLinksResult = await db.query(`DELETE FROM file_download_link WHERE file_id = ANY($1)`, [
      fileIds,
    ]);

    return {
      deletedFileCount: deleteFileInfoResult.rowCount,
      deletedLinkCount: deleteDownloadLinksResult.rowCount,
    };
  } catch (err) {
    console.error(err);
  }
};

exports.favouriteFileByFileId = async (file_id, favouriteState) => {
  try {
    const query = `
    UPDATE file_info
    SET favourite = $1
    WHERE id = $2
    RETURNING *;
  `;
    const values = [favouriteState, file_id];

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return Promise.reject({ code: "FILE_NOT_FOUND", message: "File not found" });
    }

    return result.rows[0];
  } catch (err) {
    console.error(err);
  }
};

exports.trashFileByFileId = async (file_id, trashState) => {
  try {
    const query = `
    UPDATE file_info
    SET trash = $1
    WHERE id = $2
    RETURNING *;
  `;
    const values = [trashState, file_id];

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return Promise.reject({ code: "FILE_NOT_FOUND", message: "File not found" });
    }

    if (trashState) {
      await db.query(`DELETE FROM file_download_link WHERE file_id = $1`, [file_id]);
    }

    return result.rows[0];
  } catch (err) {
    console.error(err);
  }
};

exports.validateDownloadLinkAndPassword = async (download_link, password) => {
  try {
    const query = `SELECT * FROM file_download_link WHERE download_url = $1`;
    const result = await db.query(query, [download_link]);

    if (result.rows.length === 0) {
      return false;
    }

    const linkInfo = result.rows[0];

    if (!linkInfo.password) {
      return true;
    }

    if (!password) {
      return Promise.reject({ code: "PASSWORD_REQUIRED", message: "Password is required" });
    }

    const isPasswordValid = await bcrypt.compare(password, linkInfo.password);

    return isPasswordValid;
  } catch (err) {
    console.error(err);
    return false;
  }
};

exports.checkAllFilesBelongToUser = async (files, user_id) => {
  try {
    const fileIds = files.map((file) => file.id);

    const query = "SELECT id FROM file_info WHERE id = ANY($1) AND user_id = $2";
    const result = await db.query(query, [fileIds, user_id]);

    const allFilesBelong = result.rows.length === fileIds.length;

    return allFilesBelong;
  } catch (err) {
    console.error(err);
    return false;
  }
};

exports.updateManyTrashFilesByFilesAndTrashState = async (files, trashState) => {
  try {
    const fileIds = files.map((file) => file.id);

    const query = `
      UPDATE file_info
      SET trash = $1
      WHERE id = ANY($2)
      RETURNING *;
    `;
    const values = [trashState, fileIds];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return Promise.reject({ code: "FILE_NOT_FOUND", message: "No files were found or updated" });
    }

    if (trashState) {
      await db.query(`DELETE FROM file_download_link WHERE file_id = ANY($1)`, [fileIds]);
    }

    return result.rows;
  } catch (err) {
    console.error(err);
  }
};
