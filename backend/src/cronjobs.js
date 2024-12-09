const cron = require("node-cron");
const db = require("../db/connection");

const deleteExpiredLinks = async () => {
  try {
    const now = new Date();
    console.log(`${now.toISOString()}: Executing remove expired download link`);
    const result = await db.query("DELETE FROM file_download_link WHERE expires_at < NOW() RETURNING *");
    console.log(`Expired links deleted: ${result.rowCount}`);
  } catch (err) {
    console.error("Error deleting expired links:", err);
  }
};

const deleteExpiredBlacklistedTokens = async () => {
  try {
    const now = new Date();
    console.log(`${now.toISOString()}: Executing remove expired blacklisted tokens`);
    const result = await db.query("DELETE FROM blacklisted_tokens WHERE expires_at < NOW() RETURNING *");
    console.log(`Expired tokens deleted: ${result.rowCount}`);
  } catch (err) {
    console.error("Error deleting expired links:", err);
  }
};

exports.startCronJob = () => {
  deleteExpiredLinks();
  deleteExpiredBlacklistedTokens();

  // 0 * * * * = every hour
  cron.schedule("0 * * * *", deleteExpiredLinks);
  cron.schedule("0 * * * *", deleteExpiredBlacklistedTokens);
};

// useful cron stuff:
// https://crontab.guru/
