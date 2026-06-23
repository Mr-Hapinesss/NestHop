const Listing = require('../models/Listing');
const { redisCache } = require('../config/redis');

const CACHE_TTL = 300; // 5 minutes

function buildFilter(query) {
  const filter = {};
  if (query.city) filter['location.city'] = new RegExp(query.city, 'i');
  if (query.area) filter['location.area'] = new RegExp(query.area, 'i');
  if (query.houseType) filter.houseType = query.houseType;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  filter.isAvailable = true;
  return filter;
}

async function getAll(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(24, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    const filter = buildFilter(req.query);

    const cacheKey = `listings:${JSON.stringify({ filter, page, limit })}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('landlord', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    const data = { listings, total, pages: Math.ceil(total / limit), page };
    await redisCache.set(cacheKey, data, CACHE_TTL);

    return res.json({ success: true, data });
  } catch (err) {
    console.error('getAll listings:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch listings' });
  }
}

async function getById(req, res) {
  try {
    const cacheKey = `listing:${req.params.id}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const listing = await Listing.findById(req.params.id)
      .populate('landlord', 'name email phone avatar')
      .lean();

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    await redisCache.set(cacheKey, listing, CACHE_TTL);
    return res.json({ success: true, data: listing });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch listing' });
  }
}

async function getMyListings(req, res) {
  try {
    const listings = await Listing.find({ landlord: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: listings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch your listings' });
  }
}

async function create(req, res) {
  try {
    if (!['landlord', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only landlords can create listings' });
    }

    const { title, description, price, houseType, address, city, area, lat, lng, notes, amenities, isAvailable } = req.body;
    const images = (req.files || []).map(f => f.path);

    if (!images.length) {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    const listing = await Listing.create({
      title, description,
      price: Number(price),
      houseType,
      location: { address, city, area, lat: Number(lat), lng: Number(lng) },
      images,
      notes,
      amenities: amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      isAvailable: isAvailable !== 'false',
      landlord: req.user._id,
    });

    await listing.populate('landlord', 'name email phone');

    // Invalidate listing caches
    await invalidateListingCaches();

    return res.status(201).json({ success: true, data: listing });
  } catch (err) {
    console.error('create listing:', err);
    return res.status(500).json({ success: false, message: 'Failed to create listing' });
  }
}

async function update(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    if (listing.landlord.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, price, houseType, address, city, area, lat, lng, notes, amenities, isAvailable, existingImages } = req.body;
    const newImages = (req.files || []).map(f => f.path);
    const kept = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
    const images = [...kept, ...newImages];

    const updates = {
      title, description,
      price: Number(price),
      houseType,
      location: { address, city, area, lat: Number(lat), lng: Number(lng) },
      images,
      notes,
      amenities: amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      isAvailable: isAvailable !== 'false',
    };

    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('landlord', 'name email phone');

    await redisCache.del(`listing:${req.params.id}`);
    await invalidateListingCaches();

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update listing' });
  }
}

async function deleteListing(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    if (listing.landlord.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await listing.deleteOne();
    await redisCache.del(`listing:${req.params.id}`);
    await invalidateListingCaches();

    return res.json({ success: true, data: null, message: 'Listing deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete listing' });
  }
}

async function invalidateListingCaches() {
  // Pattern-delete all listing list caches (Redis SCAN)
  try {
    const { getRedis } = require('../config/redis');
    const r = await getRedis();
    let cursor = 0;
    do {
      const result = await r.scan(cursor, { MATCH: 'listings:*', COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length) await r.del(result.keys);
    } while (cursor !== 0);
  } catch (e) {
    console.error('Cache invalidation error:', e.message);
  }
}

module.exports = { getAll, getById, getMyListings, create, update, deleteListing };
