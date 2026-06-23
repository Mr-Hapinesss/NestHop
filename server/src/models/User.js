const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    sparse: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['tenant', 'landlord', 'admin'],
    default: 'tenant',
  },
  avatar: String,
  isBanned: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastSeen: Date,
}, {
  timestamps: true,
});

// Ensure at least one contact
userSchema.pre('save', function (next) {
  if (!this.email && !this.phone) {
    return next(new Error('Either email or phone is required'));
  }
  next();
});

userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);