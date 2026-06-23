const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');

async function handleChat(io, socket) {
  // Join conversation room
  socket.on('chat:join', (conversationId) => {
    socket.join(`conv:${conversationId}`);
  });

  socket.on('chat:leave', (conversationId) => {
    socket.leave(`conv:${conversationId}`);
  });

  // Send message
  socket.on('chat:send', async ({ conversationId, content, recipientId }) => {
    try {
      if (!content?.trim() || !conversationId) return;

      // Verify sender is a participant
      const conv = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
      });
      if (!conv) return;

      // Save message
      const message = await Message.create({
        conversationId,
        sender: socket.userId,
        content: content.trim(),
      });

      await message.populate('sender', 'name avatar');

      // Increment unread for recipient
      if (recipientId) {
        await Conversation.updateOne(
          { _id: conversationId },
          {
            lastMessage: message._id,
            updatedAt: new Date(),
            $inc: { [`unreadCounts.${recipientId}`]: 1 },
          }
        );
      }

      // Broadcast to room
      io.to(`conv:${conversationId}`).emit('chat:message', message);

      // Notify recipient if not in room (push notification via socket)
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('chat:notification', {
          conversationId,
          message: message.content.slice(0, 60),
          from: message.sender.name,
        });
      }
    } catch (err) {
      console.error('chat:send error:', err);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('chat:typing', ({ conversationId, isTyping }) => {
    socket.to(`conv:${conversationId}`).emit('chat:typing', {
      userId: socket.userId,
      isTyping,
    });
  });
}

module.exports = { handleChat };