const express = require('express');
const router  = express.Router();
const {
  signup, verifySignup, login, sendOTP, verifyOTP,
  forgotPassword, verifyResetOTP, resetPassword,
  getMe, updateProfile, changePassword,
} = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');
const { otpLimiter, authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/signup',            authLimiter, signup);
router.post('/verify-signup',     authLimiter, verifySignup);
router.post('/login',             authLimiter, login);
router.post('/send-otp',          otpLimiter,  sendOTP);
router.post('/verify-otp',        authLimiter, verifyOTP);
router.post('/forgot-password',   otpLimiter,  forgotPassword);
router.post('/verify-reset-otp',  authLimiter, verifyResetOTP);
router.post('/reset-password',    authLimiter, resetPassword);
router.get ('/me',                auth,        getMe);
router.patch('/profile',          auth,        updateProfile);
router.patch('/change-password',  auth,        changePassword);

module.exports = router;