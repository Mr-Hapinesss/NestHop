const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const { signToken } = require('../utils/jwt');
const { sendOTPEmail } = require('../utils/mailer');
const { sendOTPSMS } = require('../utils/sms');
const { redisCache } = require('../config/redis');

const OTP_REDIS_TTL = 2 * 60; // 2 minutes in seconds
const MAX_OTP_ATTEMPTS = 5;

/**
 * POST /api/auth/send-otp
 */
async function sendOTP(req, res) {
  try {
    const { contact, contactType, name, role = 'tenant' } = req.body;

    if (!contact || !contactType) {
      return res.status(400).json({ success: false, message: 'Contact and contactType required' });
    }

    // Check if user already exists
    const query = contactType === 'email' ? { email: contact } : { phone: contact };
    let user = await User.findOne(query);
    const isNewUser = !user;

    // New user requires name
    if (isNewUser && !name) {
      return res.status(400).json({ success: false, message: 'Name required for new users' });
    }

    // Rate limit OTP by contact (Redis)
    const rateLimitKey = `otp_rate:${contact}`;
    const rateLimited = await redisCache.get(rateLimitKey);
    if (rateLimited) {
      const ttl = rateLimited.retryAfter;
      return res.status(429).json({
        success: false,
        message: `Please wait ${Math.ceil((ttl - Date.now()) / 1000)}s before requesting another OTP`,
      });
    }

    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Store OTP in Redis (2 min TTL)
    await redisCache.set(`otp:${contact}`, {
      otp, name, role, contactType, attempts: 0,
    }, OTP_REDIS_TTL);

    // Rate-limit key: block resend for 2 minutes
    await redisCache.set(rateLimitKey, { retryAfter: expiresAt.getTime() }, OTP_REDIS_TTL);

    // Also persist to MongoDB (for 24h TTL cleanup)
    await OTP.findOneAndUpdate(
      { contact },
      { contact, contactType, otp: await bcrypt.hash(otp, 10), name, role, expiresAt, attempts: 0 },
      { upsert: true, new: true }
    );

    // Send OTP
    if (contactType === 'email') {
      await sendOTPEmail(contact, otp, name || user?.name);
    } else {
      await sendOTPSMS(contact, otp);
    }

    return res.json({
      success: true,
      data: { expiresAt: expiresAt.getTime() },
      message: 'OTP sent',
    });
  } catch (err) {
    console.error('sendOTP error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
}

/**
 * POST /api/auth/verify-otp
 */
async function verifyOTP(req, res) {
  try {
    const { contact, otp } = req.body;
    if (!contact || !otp) {
      return res.status(400).json({ success: false, message: 'Contact and OTP required' });
    }

    // Get from Redis first (fast path)
    const cached = await redisCache.get(`otp:${contact}`);
    if (!cached) {
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }

    if (cached.attempts >= MAX_OTP_ATTEMPTS) {
      await redisCache.del(`otp:${contact}`);
      return res.status(400).json({ success: false, message: 'Too many failed attempts. Request a new OTP.' });
    }

    // Verify OTP from DB (has hashed otp)
    const otpDoc = await OTP.findOne({ contact });
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      await redisCache.del(`otp:${contact}`);
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }

    const valid = await bcrypt.compare(otp, otpDoc.otp);
    if (!valid) {
      // Increment attempts
      cached.attempts += 1;
      await redisCache.set(`otp:${contact}`, cached, OTP_REDIS_TTL);
      await OTP.updateOne({ contact }, { $inc: { attempts: 1 } });
      return res.status(400).json({ success: false, message: `Invalid OTP. ${MAX_OTP_ATTEMPTS - cached.attempts} attempts left.` });
    }

    // OTP valid — find or create user
    const query = cached.contactType === 'email' ? { email: contact } : { phone: contact };
    let user = await User.findOne(query);

    if (!user) {
      user = await User.create({
        name: cached.name,
        role: cached.role || 'tenant',
        [cached.contactType]: contact,
        isVerified: true,
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Cleanup
    await redisCache.del(`otp:${contact}`);
    await redisCache.del(`otp_rate:${contact}`);
    await OTP.deleteOne({ contact });

    // Invalidate cached user
    await redisCache.del(`user:${user._id}`);

    const token = signToken({ userId: user._id, role: user.role });

    return res.json({
      success: true,
      data: { token, user: { ...user.toObject(), password: undefined } },
      message: 'Verified successfully',
    });
  } catch (err) {
    console.error('verifyOTP error:', err);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res) {
  return res.json({ success: true, data: req.user });
}

/**
 * PATCH /api/auth/profile
 */
async function updateProfile(req, res) {
  try {
    const { name, role } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (role && ['tenant', 'landlord'].includes(role)) updates.role = role;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).lean();
    await redisCache.del(`user:${req.user._id}`);

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Update failed' });
  }
}

module.exports = { sendOTP, verifyOTP, getMe, updateProfile };
