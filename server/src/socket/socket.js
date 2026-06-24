const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { handlePresence } = require('./handlers/presence.handler');
const { handleChat } = require('./handlers/chat.handler');
const { CLIENT_URL } = require('../config/env');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).lean();
      if (!user) return next(new Error('User not found'));
      if (user.isBanned) return next(new Error('Account suspended'));

      socket.userId = decoded.userId;
      socket.userRole = user.role;
      socket.userName = user.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId} (${socket.id})`);

    // Join personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Register handlers
    handlePresence(io, socket);
    handleChat(io, socket);

    socket.on('disconnect', () => {
      console.log(` Socket disconnected: ${socket.userId} (${socket.id})`);
    });

    socket.on('error', (err) => {
      console.error(`Socket error [${socket.userId}]:`, err.message);
    });
  });

  return io;
}

module.exports = initSocket;