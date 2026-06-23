const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, getMe, updateProfile } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { otpLimiter, authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', authLimiter, verifyOTP);
router.get('/me', authMiddleware, getMe);
router.patch('/profile', authMiddleware, updateProfile);

module.exports = router;