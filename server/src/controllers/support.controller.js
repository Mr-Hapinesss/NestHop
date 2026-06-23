const SupportTicket = require('../models/SupportTicket');

async function createTicket(req, res) {
  try {
    const { contact, message } = req.body;
    if (!contact || !message) {
      return res.status(400).json({ success: false, message: 'Contact and message are required' });
    }

    const ticket = await SupportTicket.create({
      contact,
      message,
      userId: req.user?._id || null,
    });

    return res.status(201).json({ success: true, data: ticket, message: 'Support request received' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit ticket' });
  }
}

module.exports = { createTicket };