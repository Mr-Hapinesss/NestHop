const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { PORT, CLIENT_URL } = require('./config/env');
const connectDB = require('./config/db');
const { getRedis } = require('./config/redis');
const initSocket = require('./socket/socket');
const { startOTPCleanupWorker } = require('./workers/otpCleanup.worker');
const { generalLimiter } = require('./middleware/rateLimit.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const listingRoutes = require('./routes/listing.routes');
const chatRoutes = require('./routes/chat.routes');
const adminRoutes = require('./routes/admin.routes');
const supportRoutes = require('./routes/support.routes');

async function bootstrap() {
  // Connect DB & Redis
  await connectDB();
  await getRedis();

  const app = express();
  const server = http.createServer(app);

  // Security & parsing
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(morgan('dev'));
  app.use(generalLimiter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/support', supportRoutes);

  // 404
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  });

  // Socket.io
  initSocket(server);

  // Background workers
  startOTPCleanupWorker();

  server.listen(PORT, () => {
    console.log(`
 NestHop Server running on port ${PORT}
 Client: ${CLIENT_URL}
 Socket.io: enabled
 Redis: caching active
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});