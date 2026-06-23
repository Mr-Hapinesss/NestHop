const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  houseType: {
    type: String,
    enum: ['Single Room', 'Bedsitter', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms', 'Studio'],
    required: true,
  },
  location: {
    address: String,
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  images: [{
    type: String,
  }],
  notes: {
    type: String,
    maxlength: 1000,
  },
  amenities: [String],
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

listingSchema.index({ 'location.city': 1 });
listingSchema.index({ 'location.area': 1 });
listingSchema.index({ houseType: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ landlord: 1 });
listingSchema.index({ isAvailable: 1 });
listingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);