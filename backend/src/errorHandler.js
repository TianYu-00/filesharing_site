const errorHandler = (err, req, res, next) => {
  // UPLOAD_ERROR
  if (err.code === "UPLOAD_ERROR") {
    res.status(400).send({
      success: false,
      msg: err.message || "File upload failed",
      data: null,
      code: err.code,
    });
  }
  // FILE_NOT_FOUND
  else if (err.code === "FILE_NOT_FOUND") {
    res.status(404).send({
      success: false,
      msg: err.message || "File not found",
      data: null,
      code: err.code,
    });
  }
  // LINK_NOT_FOUND
  else if (err.code === "LINK_NOT_FOUND") {
    res.status(404).send({
      success: false,
      msg: err.message || "Link not found",
      data: null,
      code: err.code,
    });
  }
  // DB_ERROR
  else if (err.code === "DB_ERROR") {
    res.status(500).send({
      success: false,
      msg: err.message || "Database error occurred",
      data: null,
      code: err.code,
    });
  }
  // LIMIT_EXCEEDED
  else if (err.code === "LIMIT_EXCEEDED") {
    res.status(403).send({
      success: false,
      msg: err.message || "Download limit as exceeded",
      data: null,
      code: err.code,
    });
  }
  // "PASSWORD_NOT_FOUND"
  else if (err.code === "PASSWORD_NOT_FOUND") {
    res.status(404).send({
      success: false,
      msg: err.message || "Password not found",
      data: null,
      code: err.code,
    });
  }
  // DUPLICATE_EMAIL
  else if (err.code === "DUPLICATE_EMAIL") {
    res.status(409).send({
      success: false,
      msg: err.message || "Please enter a different email.",
      data: null,
      code: err.code,
    });
  }
  // USER_NOT_FOUND
  else if (err.code === "USER_NOT_FOUND") {
    res.status(404).send({
      success: false,
      msg: err.message || "User not found",
      data: null,
      code: err.code,
    });
  }
  // INCORRECT_PASSWORD
  else if (err.code === "INCORRECT_PASSWORD") {
    res.status(401).send({
      success: false,
      msg: err.message || "Incorrect password",
      data: null,
      code: err.code,
    });
  }
  // PASSWORD_REQUIRED
  else if (err.code === "PASSWORD_REQUIRED") {
    res.status(401).send({
      success: false,
      msg: err.message || "Password is required",
      data: null,
      code: err.code,
    });
  }
  // BLACKLISTED_TOKEN
  else if (err.code === "BLACKLISTED_TOKEN") {
    res.status(401).send({
      success: false,
      msg: err.message || "Token has been blocked",
      data: null,
      code: err.code,
    });
  }
  // NOT_LOGGED_IN
  else if (err.code === "NOT_LOGGED_IN") {
    res.status(401).send({
      success: false,
      msg: err.message || "User not logged in",
      data: null,
      code: err.code,
    });
  }
  // 23505
  else if (err.code === "23505") {
    res.status(409).send({
      success: false,
      msg: "Data already exists.",
      data: null,
      code: err.code,
    });
  }
  // MISSING_CREDENTIALS
  else if (err.code === "MISSING_CREDENTIALS") {
    res.status(400).send({
      success: false,
      msg: err.message || "Missing credentials",
      data: null,
      code: err.code,
    });
  }
  // INVALID_ID
  else if (err.code === "INVALID_ID") {
    res.status(400).send({
      success: false,
      msg: err.message || "Invalid ID",
      data: null,
      code: err.code,
    });
  }
  // INVALID_BODY
  else if (err.code === "INVALID_BODY") {
    res.status(400).send({
      success: false,
      msg: err.message || "Invalid body",
      data: null,
      code: err.code,
    });
  }
  // FILE_SIZE_LIMIT_EXCEEDED
  else if (err.code === "FILE_SIZE_LIMIT_EXCEEDED") {
    res.status(400).send({
      success: false,
      msg: err.message || "File size exceeded",
      data: null,
      code: err.code,
    });
  }

  next(err);
};

module.exports = errorHandler;
