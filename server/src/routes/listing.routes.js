const express = require('express');
const router = express.Router();
const { getAll, getById, getMyListings, create, update, deleteListing } = require('../controllers/listing.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', getAll);
router.get('/my', authMiddleware, getMyListings);
router.get('/:id', getById);
router.post('/', authMiddleware, upload.array('images', 10), create);
router.put('/:id', authMiddleware, upload.array('images', 10), update);
router.delete('/:id', authMiddleware, deleteListing);

module.exports = router;