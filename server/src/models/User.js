const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100 },
  email: { 
    type: String, 
    sparse: true, 
    lowercase: true, 
    trim: true },
  phone: { 
    type: String, 
    sparse: true, 
    trim: true },
  password: { 
    type: String, 
    select: false }, // hashed, optional
  role: { type: 
    String, 
    enum: ['tenant', 'landlord', 'admin'], 
    default: 'tenant' },
  avatar: String,
  isBanned: { 
    type: Boolean, 
    default: false },
  isVerified: { 
    type: Boolean, 
    default: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  lastSeen: Date,
}, { timestamps: true });

userSchema.pre('save', function (next) {
  if (!this.email && !this.phone) return next(new Error('Email or phone required'));
  next();
});

userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ phone: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);