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
app.all("*", (req, res) => {
  res.status(404).send({ success: false, msg: "ROUTE NOT FOUND", data: null });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ success: false, msg: "INTERNAL SERVER ERROR", data: null });
});

module.exports = app;
