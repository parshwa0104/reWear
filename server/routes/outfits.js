const express = require('express');
const db = require('../store');
const auth = require('../middleware/auth');
const router = express.Router();

// Price suggestion based on category
const SUGGESTED_PRICES = {
  'Casual': 199,
  'Party': 399,
  'Ethnic': 499,
  'Streetwear': 299
};

// Calculate average rating
const withAvgRating = (outfit) => {
  if (!outfit) return null;
  const reviews = outfit.reviews || [];
  const avgRating = reviews.length
    ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
    : 0;
  return { ...outfit, avgRating };
};

// ─── GET /api/outfits ─────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, size } = req.query;
    const list = db.outfits.findAll({ category, search, minPrice, maxPrice, size });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/outfits/suggest-price/:category ─────────────────────────────────
// NOTE: must come BEFORE /:id to avoid being swallowed by that route
router.get('/suggest-price/:category', (req, res) => {
  const price = SUGGESTED_PRICES[req.params.category] || 250;
  res.json({ suggestedPrice: price });
});

// ─── GET /api/outfits/user/:userId ────────────────────────────────────────────
router.get('/user/:userId', (req, res) => {
  try {
    const list = db.outfits.findByOwner(req.params.userId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/outfits/:id ─────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const outfit = db.outfits.findById(req.params.id);
    if (!outfit) return res.status(404).json({ error: 'Outfit not found' });
    res.json(withAvgRating(outfit));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/outfits ────────────────────────────────────────────────────────
router.post('/', auth, (req, res) => {
  try {
    const { title, description, images, category, size, brand, condition, pricePerDay, securityDeposit, location } = req.body;

    if (!title || !category || !size || !pricePerDay) {
      return res.status(400).json({ error: 'Title, category, size and price are required' });
    }

    const suggestedPrice = SUGGESTED_PRICES[category] || 250;

    const outfit = db.outfits.create({
      ownerId: req.userId,
      title,
      description: description || '',
      images: Array.isArray(images) ? images : [],
      category,
      size,
      brand: brand || 'Unbranded',
      condition: condition || 'Good',
      pricePerDay: Number(pricePerDay),
      securityDeposit: Number(securityDeposit || Math.round(pricePerDay * 2)),
      suggestedPrice,
      isAvailable: true,
      location: location || 'Mumbai, India'
    });

    // Update user outfitsListed count (in-memory)
    const user = db.users.findById(req.userId);
    if (user) db.users.update(req.userId, { outfitsListed: (user.outfitsListed || 0) + 1 });

    res.status(201).json({ message: 'Outfit listed successfully! 🌿', outfit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/outfits/:id/reviews ───────────────────────────────────────────
router.post('/:id/reviews', auth, (req, res) => {
  try {
    const { rating, comment } = req.body;
    const user = db.users.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const outfit = db.outfits.findById(req.params.id);
    if (!outfit) return res.status(404).json({ error: 'Outfit not found' });

    const review = db.reviews.create({
      userId: req.userId,
      userName: user.name,
      outfitId: req.params.id,
      rating: Number(rating),
      comment
    });

    res.json({ message: 'Review added!', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DELETE /api/outfits/:id ──────────────────────────────────────────────────
router.delete('/:id', auth, (req, res) => {
  try {
    const deleted = db.outfits.delete(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ error: 'Outfit not found or not authorized' });

    const user = db.users.findById(req.userId);
    if (user) db.users.update(req.userId, { outfitsListed: Math.max(0, (user.outfitsListed || 1) - 1) });

    res.json({ message: 'Outfit removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
