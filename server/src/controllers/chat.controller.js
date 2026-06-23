const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { redisCache } = require('../config/redis');

async function getConversations(req, res) {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email phone avatar')
      .populate('listing', 'title images houseType')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();

    // Attach unread count for current user
    const withUnread = conversations.map(conv => ({
      ...conv,
      unreadCount: conv.unreadCounts?.[req.user._id.toString()] || 0,
    }));

    return res.json({ success: true, data: withUnread });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
}

async function getOrCreateConversation(req, res) {
  try {
    const { listingId, landlordId } = req.body;
    const userId = req.user._id.toString();

    if (userId === landlordId) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    // Find existing conversation for this listing between these two users
    let conversation = await Conversation.findOne({
      listing: listingId,
      participants: { $all: [userId, landlordId] },
    })
      .populate('participants', 'name email phone avatar')
      .populate('listing', 'title images houseType');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, landlordId],
        listing: listingId,
        unreadCounts: { [landlordId]: 0, [userId]: 0 },
      });
      await conversation.populate('participants', 'name email phone avatar');
      await conversation.populate('listing', 'title images houseType');
    }

    return res.json({ success: true, data: conversation });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to get/create conversation' });
  }
}

async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 30;
    const skip = (page - 1) * limit;

    // Verify participant
    const conv = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
    if (!conv) return res.status(403).json({ success: false, message: 'Access denied' });

    const [messages, total] = await Promise.all([
      Message.find({ conversationId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ conversationId }),
    ]);

    return res.json({
      success: true,
      data: { messages: messages.reverse(), hasMore: total > skip + limit },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
}

async function markRead(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    await Conversation.updateOne(
      { _id: conversationId, participants: userId },
      { $set: { [`unreadCounts.${userId}`]: 0 } }
    );

    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    return res.json({ success: true, data: null });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
}

module.exports = { getConversations, getOrCreateConversation, getMessages, markRead };
