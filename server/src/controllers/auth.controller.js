const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const { signToken } = require('../utils/jwt');
const { sendOTPEmail } = require('../utils/mailer');
const { sendOTPSMS } = require('../utils/sms');
const { redisCache } = require('../config/redis');

const OTP_TTL = 120;        // 2 min
const RESET_TTL = 600;      // 10 min
const MAX_ATTEMPTS = 5;

//  helpers 
function contactQuery(contact, type) {
  return type === 'email' ? { email: contact } : { phone: contact };
}

async function deliverOTP(contact, type, otp, name) {
  if (type === 'email') await sendOTPEmail(contact, otp, name);
  else await sendOTPSMS(contact, otp);
}

function safeUser(user) {
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  delete u.passwordResetToken;
  delete u.passwordResetExpires;
  return u;
}

//  POST /api/auth/signup 
async function signup(req, res) {
  try {
    const { name, contact, contactType, password, role = 'tenant' } = req.body;

    if (!name || !contact || !contactType || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne(contactQuery(contact, contactType));
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this contact already exists. Please sign in.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const otp    = generateOTP();
    const expiry = getOTPExpiry();

    // Cache pending registration (don't create user yet — wait for OTP)
    await redisCache.set(`signup:${contact}`, {
      name, contact, contactType,
      password: hashed, role,
      otp, expiresAt: expiry.getTime(),
    }, OTP_TTL + 30);

    // Persist OTP doc
    await OTP.findOneAndUpdate(
      { contact },
      { contact, contactType, otp: await bcrypt.hash(otp, 10), name, role, expiresAt: expiry, attempts: 0 },
      { upsert: true, new: true }
    );

    await deliverOTP(contact, contactType, otp, name);

    return res.json({
      success: true,
      data: { expiresAt: expiry.getTime(), requiresOTP: true },
      message: 'Verification code sent',
    });
  } catch (err) {
    console.error('signup:', err);
    return res.status(500).json({ success: false, message: 'Signup failed' });
  }
}

//  POST /api/auth/verify-signup 
async function verifySignup(req, res) {
  try {
    const { contact, otp } = req.body;
    if (!contact || !otp) return res.status(400).json({ success: false, message: 'Contact and OTP required' });

    const pending = await redisCache.get(`signup:${contact}`);
    if (!pending) return res.status(400).json({ success: false, message: 'Session expired. Please sign up again.' });

    const otpDoc = await OTP.findOne({ contact });
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      await redisCache.del(`signup:${contact}`);
      return res.status(400).json({ success: false, message: 'OTP expired. Please sign up again.' });
    }

    if (otpDoc.attempts >= MAX_ATTEMPTS) {
      await redisCache.del(`signup:${contact}`);
      return res.status(400).json({ success: false, message: 'Too many attempts. Please sign up again.' });
    }

    const valid = await bcrypt.compare(otp, otpDoc.otp);
    if (!valid) {
      await OTP.updateOne({ contact }, { $inc: { attempts: 1 } });
      const left = MAX_ATTEMPTS - (otpDoc.attempts + 1);
      return res.status(400).json({ success: false, message: `Invalid code. ${left} attempt${left !== 1 ? 's' : ''} left.` });
    }

    // Create user
    const user = await User.create({
      name: pending.name,
      [pending.contactType]: contact,
      password: pending.password,
      role: pending.role,
      isVerified: true,
    });

    await redisCache.del(`signup:${contact}`);
    await OTP.deleteOne({ contact });

    const token = signToken({ userId: user._id, role: user.role });
    return res.status(201).json({ success: true, data: { token, user: safeUser(user) } });
  } catch (err) {
    console.error('verifySignup:', err);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
}

//  POST /api/auth/login 
async function login(req, res) {
  try {
    const { contact, contactType, password } = req.body;
    if (!contact || !contactType || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = await User.findOne(contactQuery(contact, contactType)).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with these details' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }
    if (!user.password) {
      // Account created via OTP-only (old flow) — prompt to set password
      return res.status(400).json({ success: false, message: 'This account has no password. Use OTP login or reset password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    await redisCache.del(`user:${user._id}`);
    const token = signToken({ userId: user._id, role: user.role });
    return res.json({ success: true, data: { token, user: safeUser(user) } });
  } catch (err) {
    console.error('login:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
}

//  POST /api/auth/send-otp  (OTP-only login) 
async function sendOTP(req, res) {
  try {
    const { contact, contactType, name, role = 'tenant' } = req.body;
    if (!contact || !contactType) {
      return res.status(400).json({ success: false, message: 'contact and contactType required' });
    }

    const rateLimitKey = `otp_rate:${contact}`;
    const limited = await redisCache.get(rateLimitKey);
    if (limited) {
      const wait = Math.ceil((limited.retryAfter - Date.now()) / 1000);
      return res.status(429).json({ success: false, message: `Wait ${wait}s before requesting another code` });
    }

    const existing = await User.findOne(contactQuery(contact, contactType));
    const isNew = !existing;
    if (isNew && !name) {
      return res.status(400).json({ success: false, message: 'Name required for new users' });
    }

    const otp    = generateOTP();
    const expiry = getOTPExpiry();

    await redisCache.set(`otp:${contact}`, { otp, name, role, contactType, attempts: 0 }, OTP_TTL);
    await redisCache.set(rateLimitKey, { retryAfter: expiry.getTime() }, OTP_TTL);

    await OTP.findOneAndUpdate(
      { contact },
      { contact, contactType, otp: await bcrypt.hash(otp, 10), name: name || existing?.name, role, expiresAt: expiry, attempts: 0 },
      { upsert: true, new: true }
    );

    await deliverOTP(contact, contactType, otp, name || existing?.name || 'there');

    return res.json({ success: true, data: { expiresAt: expiry.getTime() } });
  } catch (err) {
    console.error('sendOTP:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
}

//  POST /api/auth/verify-otp
async function verifyOTP(req, res) {
  try {
    const { contact, otp } = req.body;
    const cached = await redisCache.get(`otp:${contact}`);
    if (!cached) return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });

    if (cached.attempts >= MAX_ATTEMPTS) {
      await redisCache.del(`otp:${contact}`);
      return res.status(400).json({ success: false, message: 'Too many attempts. Request a new code.' });
    }

    const otpDoc = await OTP.findOne({ contact });
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      await redisCache.del(`otp:${contact}`);
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }

    const valid = await bcrypt.compare(otp, otpDoc.otp);
    if (!valid) {
      cached.attempts += 1;
      await redisCache.set(`otp:${contact}`, cached, OTP_TTL);
      await OTP.updateOne({ contact }, { $inc: { attempts: 1 } });
      return res.status(400).json({ success: false, message: `Invalid code. ${MAX_ATTEMPTS - cached.attempts} left.` });
    }

    const query = contactQuery(contact, cached.contactType);
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

    await redisCache.del(`otp:${contact}`);
    await redisCache.del(`otp_rate:${contact}`);
    await redisCache.del(`user:${user._id}`);
    await OTP.deleteOne({ contact });

    const token = signToken({ userId: user._id, role: user.role });
    return res.json({ success: true, data: { token, user: safeUser(user) } });
  } catch (err) {
    console.error('verifyOTP:', err);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
}

//  POST /api/auth/forgot-password 
async function forgotPassword(req, res) {
  try {
    const { contact, contactType } = req.body;
    if (!contact || !contactType) {
      return res.status(400).json({ success: false, message: 'contact and contactType required' });
    }

    // Always return success to prevent user enumeration
    const user = await User.findOne(contactQuery(contact, contactType));
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset code was sent.' });
    }

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + RESET_TTL * 1000); // 10 min

    const tokenRaw  = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');

    // Store reset state in Redis
    await redisCache.set(`reset:${contact}`, {
      otp, contactType,
      tokenHash,
      expiresAt: expiry.getTime(),
      attempts: 0,
    }, RESET_TTL);

    await deliverOTP(contact, contactType, otp, user.name);

    return res.json({ success: true, message: 'If an account exists, a reset code was sent.' });
  } catch (err) {
    console.error('forgotPassword:', err);
    return res.status(500).json({ success: false, message: 'Failed to send reset code' });
  }
}

//  POST /api/auth/verify-reset-otp 
async function verifyResetOTP(req, res) {
  try {
    const { contact, otp } = req.body;
    const cached = await redisCache.get(`reset:${contact}`);

    if (!cached || cached.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Reset code expired. Request a new one.' });
    }
    if (cached.attempts >= MAX_ATTEMPTS) {
      await redisCache.del(`reset:${contact}`);
      return res.status(400).json({ success: false, message: 'Too many attempts.' });
    }
    if (cached.otp !== otp) {
      cached.attempts += 1;
      await redisCache.set(`reset:${contact}`, cached, RESET_TTL);
      return res.status(400).json({ success: false, message: `Invalid code. ${MAX_ATTEMPTS - cached.attempts} left.` });
    }

    // OTP correct — issue a short-lived reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    await redisCache.set(`reset_token:${resetToken}`, { contact, contactType: cached.contactType }, 300); // 5 min
    await redisCache.del(`reset:${contact}`);

    return res.json({ success: true, data: { resetToken } });
  } catch (err) {
    console.error('verifyResetOTP:', err);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
}

//  POST /api/auth/reset-password 
async function resetPassword(req, res) {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const cached = await redisCache.get(`reset_token:${resetToken}`);
    if (!cached) {
      return res.status(400).json({ success: false, message: 'Reset session expired. Start over.' });
    }

    const { contact, contactType } = cached;
    const hashed = await bcrypt.hash(newPassword, 12);

    const user = await User.findOneAndUpdate(
      contactQuery(contact, contactType),
      { password: hashed, isVerified: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'Account not found' });

    await redisCache.del(`reset_token:${resetToken}`);
    await redisCache.del(`user:${user._id}`);

    const token = signToken({ userId: user._id, role: user.role });
    return res.json({ success: true, data: { token, user: safeUser(user) }, message: 'Password reset successfully' });
  } catch (err) {
    console.error('resetPassword:', err);
    return res.status(500).json({ success: false, message: 'Reset failed' });
  }
}

//  GET /api/auth/me 
async function getMe(req, res) {
  return res.json({ success: true, data: req.user });
}

//  PATCH /api/auth/profile 
async function updateProfile(req, res) {
  try {
    const { name, role } = req.body;
    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (role && ['tenant', 'landlord'].includes(role)) updates.role = role;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).lean();
    await redisCache.del(`user:${req.user._id}`);
    return res.json({ success: true, data: user });
  } catch {
    return res.status(500).json({ success: false, message: 'Update failed' });
  }
}

// PATCH /api/auth/change-password 
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both fields required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'No password set. Use forgot password.' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    await redisCache.del(`user:${user._id}`);

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch {
    return res.status(500).json({ success: false, message: 'Change password failed' });
  }
}

module.exports = {
  signup, verifySignup, login, sendOTP, verifyOTP,
  forgotPassword, verifyResetOTP, resetPassword,
  getMe, updateProfile, changePassword,
};