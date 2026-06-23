const cron = require('node-cron');
const OTP = require('../models/OTP');

/**
 * MongoDB TTL index on OTP.createdAt handles the 24h auto-delete.
 * This cron is a safety net for any edge cases and logs cleanup stats.
 * Runs every hour.
 */
function startOTPCleanupWorker() {
  cron.schedule('0 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await OTP.deleteMany({ createdAt: { $lt: cutoff } });
      if (result.deletedCount > 0) {
        console.log(`🧹 OTP cleanup: removed ${result.deletedCount} expired OTP records`);
      }
    } catch (err) {
      console.error('OTP cleanup worker error:', err.message);
    }
  });

  console.log('⏰ OTP cleanup worker started (runs every hour)');
}

module.exports = { startOTPCleanupWorker };