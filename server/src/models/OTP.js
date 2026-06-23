const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  contact: {
    type: String,
    required: true,
    index: true,
  },
  contactType: {
    type: String,
    enum: ['email', 'phone'],
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  name: String,
  role: {
    type: String,
    enum: ['tenant', 'landlord', 'admin'],
    default: 'tenant',
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
    // 2-minute OTP window
  },
  // TTL index: auto-delete document 24h after creation if unverified
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 86400 }, // 24 hours
  },
});

module.exports = mongoose.model('OTP', otpSchema);