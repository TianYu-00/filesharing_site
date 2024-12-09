const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // https://www.npmjs.com/package/cookie-parser
const apiRouter = require("./routes/api-router");

const app = express();
const corsConfigOptions = {
  origin: "http://127.0.0.1:5173",
  credentials: true,
};
// Middlewares
app.use(cors(corsConfigOptions));
app.use(cookieParser());
app.use(express.json());

// Routes
app.get("/test", (req, res) => {
  res.send({ success: true, msg: "Hello World!", data: null });
});

app.use("/api", apiRouter);

// Error Handling
app.use((err, req, res, next) => {
  // UPLOAD_ERROR
  if (err.code === "UPLOAD_ERROR") {
    res.status(400).send({
      success: false,
      msg: err.message || "File upload failed",
      data: null,
    });
  }
  // FILE_NOT_FOUND
  else if (err.code === "FILE_NOT_FOUND") {
    res.status(404).send({
      success: false,
      msg: err.message || "File not found",
      data: null,
    });
  }
  // LINK_NOT_FOUND
  else if (err.code === "LINK_NOT_FOUND") {
    res.status(404).send({
      success: false,
      msg: err.message || "Link not found",
      data: null,
    });
  }
  // DB_ERROR
  else if (err.code === "DB_ERROR") {
    res.status(500).send({
      success: false,
      msg: err.message || "Database error occurred",
      data: null,
    });
  }
  // LIMIT_EXCEEDED
  else if (err.code === "LIMIT_EXCEEDED") {
    res.status(500).send({
      success: false,
      msg: err.message || "Download limit as exceeded",
      data: null,
    });
  }
  // "PASSWORD_NOT_FOUND"
  else if (err.code === "PASSWORD_NOT_FOUND") {
    res.status(500).send({
      success: false,
      msg: err.message || "Password not found",
      data: null,
    });
  }
  // DUPLICATE_EMAIL
  else if (err.code === "DUPLICATE_EMAIL") {
    res.status(409).send({
      success: false,
      msg: err.message || "Please enter a different email.",
      data: null,
    });
  }
  // USER_NOT_FOUND
  else if (err.code === "USER_NOT_FOUND") {
    res.status(404).send({
      success: false,
      msg: err.message || "User not found",
      data: null,
    });
  }
  // INCORRECT_PASSWORD
  else if (err.code === "INCORRECT_PASSWORD") {
    res.status(401).send({
      success: false,
      msg: err.message || "Incorrect password",
      data: null,
    });
  }
  // PASSWORD_REQUIRED
  else if (err.code === "PASSWORD_REQUIRED") {
    res.status(401).send({
      success: false,
      msg: err.message || "Password is required",
      data: null,
    });
  }
  // BLACKLISTED_TOKEN
  else if (err.code === "BLACKLISTED_TOKEN") {
    res.status(401).send({
      success: false,
      msg: err.message || "Token has been blocked",
      data: null,
    });
  }
  // 23505
  else if (err.code === "23505") {
    res.status(409).send({
      success: false,
      msg: "Data already exists.",
      data: null,
    });
  }

  // Final
  else {
    next(err);
  }
});

app.all("*", (req, res) => {
  res.status(404).send({ success: false, msg: "ROUTE NOT FOUND", data: null });
});

app.use((err, req, res, next) => {
  res.status(500).send({ success: false, msg: "INTERNAL SERVER ERROR", data: null });
});

module.exports = app;
