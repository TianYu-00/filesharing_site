const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const apiRouter = require("./routes/api-router");
const { rateLimit } = require("express-rate-limit");
const errorHandler = require("./src/errorHandler");

const app = express();
const corsConfigOptions = {
  origin: process.env.FRONTEND_URL || "http://127.0.0.1:5173",
  credentials: true,
};
app.set("trust proxy", 3);
// Middlewares
app.use(cors(corsConfigOptions));
app.use(cookieParser());
app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
});
app.use(globalLimiter);

// Routes
app.get("/api/test", (req, res) => {
  res.send({ success: true, msg: "Hello World!", data: null });
});

app.use("/api", apiRouter);

// Error Handling
app.use(errorHandler);

app.all("*", (req, res) => {
  res.status(404).send({ success: false, msg: "ROUTE NOT FOUND", data: null });
});

app.use((err, req, res, next) => {
  res.status(500).send({ success: false, msg: "INTERNAL SERVER ERROR", data: null });
});

module.exports = app;
