const { redisCache } = require('../../config/redis');

const onlineUsers = new Map(); // userId -> Set of socketIds

async function handlePresence(io, socket) {
  const userId = socket.userId;
  if (!userId) return;

  // Track socket
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  // Broadcast online
  socket.broadcast.emit('user:online', userId);

  // Send current online list to this socket
  const onlineList = [...onlineUsers.keys()];
  socket.emit('users:online', onlineList);

  // Update last seen in Redis
  await redisCache.set(`presence:${userId}`, { online: true, lastSeen: new Date() }, 3600);

  socket.on('disconnect', async () => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit('user:offline', userId);
        await redisCache.set(`presence:${userId}`, { online: false, lastSeen: new Date() }, 3600);
      }
    }
  });
}

module.exports = { handlePresence };