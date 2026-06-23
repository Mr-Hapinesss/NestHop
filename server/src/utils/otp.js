const crypto = require('crypto');

/**
 * Generate a secure 6-digit OTP
 */
function generateOTP() {
  const bytes = crypto.randomBytes(3);
  const num = (bytes.readUIntBE(0, 3) % 900000) + 100000;
  return String(num);
}

/**
 * OTP expiry: 2 minutes from now
 */
function getOTPExpiry() {
  return new Date(Date.now() + 2 * 60 * 1000);
}

module.exports = { generateOTP, getOTPExpiry };