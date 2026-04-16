const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const router = express.Router();

// Price suggestion based on category
const SUGGESTED_PRICES = {
  'Casual': 199,
  'Party': 399,
  'Ethnic': 499,
  'Streetwear': 299
};

// Calculate average rating dynamically
const getOutfitWithRating = (outfit) => {
  let avgRating = 0;
  if (outfit.reviews && outfit.reviews.length > 0) {
    const sum = outfit.reviews.reduce((acc, r) => acc + r.rating, 0);
    avgRating = Number((sum / outfit.reviews.length).toFixed(1));
  }
  return { ...outfit, avgRating };
};

// Get all outfits (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, size } = req.query;
    
    const where = { isAvailable: true };
    if (category && category !== 'All') where.category = category;
    if (size) where.size = size;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = Number(minPrice);
      if (maxPrice) where.pricePerDay.lte = Number(maxPrice);
    }

    const outfits = await prisma.outfit.findMany({
      where,
      include: {
        owner: { select: { name: true, avatar: true, rating: true, location: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOutfits = outfits.map(o => ({ ...o, images: JSON.parse(o.images) }));
    res.json(formattedOutfits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single outfit
router.get('/:id', async (req, res) => {
  try {
    const outfit = await prisma.outfit.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, avatar: true, rating: true, location: true, totalRentals: true } },
        reviews: { orderBy: { createdAt: 'desc' } }
      }
    });
    
    if (!outfit) return res.status(404).json({ error: 'Outfit not found' });
    
    outfit.images = JSON.parse(outfit.images);
    res.json(getOutfitWithRating(outfit));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get suggested price
router.get('/suggest-price/:category', (req, res) => {
  const price = SUGGESTED_PRICES[req.params.category] || 250;
  res.json({ suggestedPrice: price });
});

// Create outfit (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, images, category, size, brand, condition, pricePerDay, securityDeposit } = req.body;

    const suggestedPrice = SUGGESTED_PRICES[category] || 250;

    const outfit = await prisma.outfit.create({
      data: {
        ownerId: req.userId,
        title,
        description: description || '',
        images: JSON.stringify(images || []),
        category,
        size,
        brand: brand || 'Unbranded',
        condition: condition || 'Good',
        pricePerDay: Number(pricePerDay),
        securityDeposit: Number(securityDeposit || Math.round(pricePerDay * 2)),
        suggestedPrice,
        location: req.body.location || 'Mumbai, India'
      },
      include: {
        owner: { select: { name: true, avatar: true, rating: true, location: true } }
      }
    });

    // Update user stats
    await prisma.user.update({
      where: { id: req.userId },
      data: { outfitsListed: { increment: 1 } }
    });

    res.status(201).json({ message: 'Outfit listed successfully! 🌿', outfit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add review to outfit
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const review = await prisma.review.create({
      data: {
        userId: req.userId,
        userName: user.name,
        outfitId: req.params.id,
        rating: Number(rating),
        comment
      }
    });

    res.json({ message: 'Review added!', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get outfits by owner
router.get('/user/:userId', async (req, res) => {
  try {
    const outfits = await prisma.outfit.findMany({
      where: { ownerId: req.params.userId },
      include: {
        owner: { select: { name: true, avatar: true, rating: true } }
      }
    });
    
    const formattedOutfits = outfits.map(o => ({ ...o, images: JSON.parse(o.images) }));
    res.json(formattedOutfits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete outfit (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const outfit = await prisma.outfit.deleteMany({
      where: { 
        id: req.params.id,
        ownerId: req.userId 
      }
    });

    if (outfit.count === 0) return res.status(404).json({ error: 'Outfit not found or not authorized' });
    
    await prisma.user.update({
      where: { id: req.userId },
      data: { outfitsListed: { decrement: 1 } }
    });
    
    res.json({ message: 'Outfit removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
