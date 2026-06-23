const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ listing: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
