const express = require('express');
const router = express.Router();
const { getConversations, getOrCreateConversation, getMessages, markRead } = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.patch('/conversations/:conversationId/read', markRead);

module.exports = router;