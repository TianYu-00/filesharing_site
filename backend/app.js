const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/api-router");

const app = express();

// Middlewares
app.use(cors());
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
  // DB_ERROR
  else if (err.code === "DB_ERROR") {
    res.status(500).send({
      success: false,
      msg: err.message || "Database error occurred",
      data: null,
    });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  // DUPLICATE_EMAIL
  if (err.code === "DUPLICATE_EMAIL") {
    res.status(409).send({
      success: false,
      msg: err.message || "Email address already in use. Please enter a different email.",
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
  // 23505
  else if (err.code === "23505") {
    res.status(409).send({
      success: false,
      msg: "Data already exists.",
      data: null,
    });
  } else {
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
