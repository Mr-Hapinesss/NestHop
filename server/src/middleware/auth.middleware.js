const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { redisCache } = require('../config/redis');

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = header.split(' ')[1];

    // Check blacklist
    const blacklisted = await redisCache.get(`blacklist:${token}`);
    if (blacklisted) {
      return res.status(401).json({ success: false, message: 'Token revoked' });
    }

    const decoded = verifyToken(token);

    // Cache user to reduce DB hits
    const cacheKey = `user:${decoded.userId}`;
    let user = await redisCache.get(cacheKey);

    if (!user) {
      user = await User.findById(decoded.userId).select('-__v').lean();
      if (user) await redisCache.set(cacheKey, user, 300); // 5 min cache
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

module.exports = authMiddleware;