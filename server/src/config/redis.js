const { createClient } = require('redis');
const { REDIS_URL } = require('./env');

let client = null;

async function getRedis() {
  if (client && client.isReady) return client;

  client = createClient({ url: REDIS_URL });

  client.on('error', err => console.error('Redis error:', err.message));
  client.on('connect', () => console.log(' Redis connected'));
  client.on('reconnecting', () => console.log(' Redis reconnecting...'));
  client.on('ready', () => console.log(' Redis ready'));

  await client.connect();
  return client;
}

const redisCache = {
  async get(key) {
    try {
      const r = await getRedis();
      const val = await r.get(key);
      return val ? JSON.parse(val) : null;
    } catch (err) {
      console.error(`Redis GET [${key}]:`, err.message);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 3600) {
    try {
      const r = await getRedis();
      await r.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Redis SET [${key}]:`, err.message);
      return false;
    }
  },

  async del(key) {
    try {
      const r = await getRedis();
      await r.del(key);
      return true;
    } catch (err) {
      console.error(`Redis DEL [${key}]:`, err.message);
      return false;
    }
  },

  async exists(key) {
    try {
      const r = await getRedis();
      const result = await r.exists(key);
      return result === 1;
    } catch (err) {
      console.error(`Redis EXISTS [${key}]:`, err.message);
      return false;
    }
  },

  async ttl(key) {
    try {
      const r = await getRedis();
      return await r.ttl(key);
    } catch (err) {
      console.error(`Redis TTL [${key}]:`, err.message);
      return -1;
    }
  },

  async keys(pattern) {
    try {
      const r = await getRedis();
      return await r.keys(pattern);
    } catch (err) {
      console.error(`Redis KEYS [${pattern}]:`, err.message);
      return [];
    }
  },

  async flush(pattern) {
    // delete all keys matching a pattern using SCAN
    try {
      const r = await getRedis();
      let cursor = 0;
      let deleted = 0;
      do {
        const result = await r.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        if (result.keys.length) {
          await r.del(result.keys);
          deleted += result.keys.length;
        }
      } while (cursor !== 0);
      return deleted;
    } catch (err) {
      console.error(`Redis FLUSH [${pattern}]:`, err.message);
      return 0;
    }
  },

  async increment(key, ttlSeconds) {
    try {
      const r = await getRedis();
      const val = await r.incr(key);
      if (ttlSeconds && val === 1) {
        await r.expire(key, ttlSeconds);
      }
      return val;
    } catch (err) {
      console.error(`Redis INCR [${key}]:`, err.message);
      return null;
    }
  },
};

module.exports = { getRedis, redisCache };