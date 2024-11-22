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

exports.startCronJob = () => {
  deleteExpiredLinks();
  cron.schedule("0 * * * *", deleteExpiredLinks); // 0 * * * * = every hour
  //   cron.schedule("* * * * *", deleteExpiredLinks); // to test
};

// useful cron stuff:
// https://crontab.guru/
