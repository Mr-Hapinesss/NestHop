const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

async function sendOTPEmail(to, otp, name = 'there') {
  const t = getTransporter();
  await t.sendMail({
    from: EMAIL_FROM,
    to,
    subject: `${otp} — Your NestHop Verification Code`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #FFF7C5; border-radius: 16px;">
        <h1 style="font-family: 'Arial Black', sans-serif; color: #4F252E; margin-bottom: 8px;">NestHop</h1>
        <p style="color: #5c3a1e; font-size: 16px;">Hi ${name},</p>
        <p style="color: #5c3a1e; font-size: 16px;">Your verification code is:</p>
        <div style="background: #4F252E; color: #FFF7C5; text-align: center; padding: 24px; border-radius: 12px; margin: 20px 0;">
          <span style="font-family: 'Arial Black', sans-serif; font-size: 40px; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in <strong>2 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: 1px solid #e8dc7a; margin: 20px 0;">
        <p style="color: #aaa; font-size: 12px;">If you didn't request this, ignore this email. Your account is safe.</p>
      </div>
    `,
  });
}

module.exports = { sendOTPEmail };