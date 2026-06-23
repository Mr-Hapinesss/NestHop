const express = require('express');
const router = express.Router();
const { createTicket } = require('../controllers/support.controller');

// Public endpoint — attach user if token present, otherwise proceed anonymously
router.post('/', async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const { verifyToken } = require('../utils/jwt');
      const { redisCache } = require('../config/redis');
      const User = require('../models/User');
      const token = header.split(' ')[1];
      const decoded = verifyToken(token);
      const cacheKey = `user:${decoded.userId}`;
      let user = await redisCache.get(cacheKey);
      if (!user) user = await User.findById(decoded.userId).lean();
      if (user && !user.isBanned) req.user = user;
    }
  } catch (_) { /* ignore auth errors — ticket can be anonymous */ }
  next();
}, createTicket);

module.exports = router;