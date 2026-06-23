const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('MongoDB connected successfully');

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Reconnecting...');
      isConnected = false;
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;