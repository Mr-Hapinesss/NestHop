const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = require('../config/env');

let twilioClient = null;

function getTwilio() {
  if (twilioClient) return twilioClient;
  if (!TWILIO_SID || !TWILIO_AUTH_TOKEN) return null;
  const twilio = require('twilio');
  twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
  return twilioClient;
}

async function sendOTPSMS(to, otp) {
  const client = getTwilio();
  if (!client) {
    // Dev fallback: log to console
    console.log(`[SMS DEV] OTP for ${to}: ${otp}`);
    return;
  }
  await client.messages.create({
    body: `Your NestHop verification code is: ${otp}. Valid for 2 minutes. Do not share.`,
    from: TWILIO_PHONE,
    to,
  });
}

module.exports = { sendOTPSMS };