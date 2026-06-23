const User = require('../models/User');
const Listing = require('../models/Listing');
const SupportTicket = require('../models/SupportTicket');
const { redisCache } = require('../config/redis');

async function getMetrics(req, res) {
  try {
    const cacheKey = 'admin:metrics';
    const cached = await redisCache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const [totalUsers, totalLandlords, totalListings, openTickets] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'landlord' }),
      Listing.countDocuments(),
      SupportTicket.countDocuments({ status: 'open' }),
    ]);

    const data = { totalUsers, totalLandlords, totalListings, openTickets };
    await redisCache.set(cacheKey, data, 60); // 1 minute cache

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch metrics' });
  }
}

async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Query too short' });
    }

    const regex = new RegExp(q, 'i');
    const users = await User.find({
      $or: [{ email: regex }, { phone: regex }, { name: regex }],
    }).limit(20).lean();

    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Search failed' });
  }
}

async function banUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: true },
      { new: true }
    ).lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot ban an admin' });

    await redisCache.del(`user:${req.params.userId}`);
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to ban user' });
  }
}

async function unbanUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: false },
      { new: true }
    ).lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await redisCache.del(`user:${req.params.userId}`);
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to unban user' });
  }
}

async function getAllListings(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find()
        .populate('landlord', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(),
    ]);

    return res.json({ success: true, data: { listings, total } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch listings' });
  }
}

async function adminDeleteListing(req, res) {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    await redisCache.del(`listing:${req.params.listingId}`);
    await redisCache.del('admin:metrics');

    return res.json({ success: true, data: null, message: 'Listing removed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete listing' });
  }
}

async function getTickets(req, res) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json({ success: true, data: tickets });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
}

async function updateTicket(req, res) {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.ticketId,
      { status },
      { new: true }
    ).lean();

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    await redisCache.del('admin:metrics');
    return res.json({ success: true, data: ticket });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update ticket' });
  }
}

async function createAdmin(req, res) {
  try {
    const { name, contact, contactType } = req.body;
    if (!name || !contact || !contactType) {
      return res.status(400).json({ success: false, message: 'name, contact, and contactType required' });
    }

    const existing = await User.findOne(
      contactType === 'email' ? { email: contact } : { phone: contact }
    );
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this contact already exists' });
    }

    const adminUser = await User.create({
      name,
      [contactType]: contact,
      role: 'admin',
      isVerified: false, // Must verify via OTP first
    });

    // Trigger OTP send
    const { generateOTP, getOTPExpiry } = require('../utils/otp');
    const { sendOTPEmail } = require('../utils/mailer');
    const { sendOTPSMS } = require('../utils/sms');
    const bcrypt = require('bcryptjs');
    const OTP = require('../models/OTP');

    const otp = generateOTP();
    const expiresAt = getOTPExpiry();
    await OTP.create({ contact, contactType, otp: await bcrypt.hash(otp, 10), name, role: 'admin', expiresAt });

    if (contactType === 'email') await sendOTPEmail(contact, otp, name);
    else await sendOTPSMS(contact, otp);

    return res.status(201).json({ success: true, data: adminUser, message: 'Admin account created. OTP sent for verification.' });
  } catch (err) {
    console.error('createAdmin:', err);
    return res.status(500).json({ success: false, message: 'Failed to create admin' });
  }
}

module.exports = { getMetrics, searchUsers, banUser, unbanUser, getAllListings, adminDeleteListing, getTickets, updateTicket, createAdmin };
