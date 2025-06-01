const express = require("express");
const db = require("../db/connection");
const healthCheckRouter = express.Router();
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 10 * 1000,
  limit: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});

healthCheckRouter.get("/", limiter, async (req, res) => {
  try {
    await db.query(`SELECT 1;`);
    res.status(200).json({ success: true, message: "Database is awake and healthy.", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database unreachable.", data: null });
  }
});

module.exports = healthCheckRouter;
