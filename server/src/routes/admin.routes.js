const express = require('express');
const router = express.Router();
const {
  getMetrics, searchUsers, banUser, unbanUser,
  getAllListings, adminDeleteListing, getTickets, updateTicket, createAdmin,
} = require('../controllers/admin.controller');
const adminMiddleware = require('../middleware/admin.middleware');

router.use(adminMiddleware);

router.get('/metrics', getMetrics);
router.get('/users', searchUsers);
router.patch('/users/:userId/ban', banUser);
router.patch('/users/:userId/unban', unbanUser);
router.get('/listings', getAllListings);
router.delete('/listings/:listingId', adminDeleteListing);
router.get('/tickets', getTickets);
router.patch('/tickets/:ticketId', updateTicket);
router.post('/create-admin', createAdmin);

module.exports = router;