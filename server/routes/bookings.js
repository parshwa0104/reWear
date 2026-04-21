const express = require('express');
const db = require('../store');
const auth = require('../middleware/auth');
const router = express.Router();

// ─── POST /api/bookings ───────────────────────────────────────────────────────
router.post('/', auth, (req, res) => {
  try {
    const { outfitId, startDate, endDate } = req.body;

    const outfit = db.outfits.findById(outfitId);
    if (!outfit) return res.status(404).json({ error: 'Outfit not found' });
    if (!outfit.isAvailable) return res.status(400).json({ error: 'Outfit is not available' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ error: 'Invalid dates' });
    }

    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const totalPrice = totalDays * outfit.pricePerDay;
    const depositAmount = outfit.securityDeposit;

    const booking = db.bookings.create({
      outfitId,
      renterId: req.userId,
      ownerId: outfit.ownerId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalDays,
      totalPrice,
      depositAmount,
      status: 'confirmed'
    });

    // Update outfit availability (in-memory)
    db.outfits.update(outfitId, { isAvailable: false, totalRentals: (outfit.totalRentals || 0) + 1 });

    // Update owner stats
    const owner = db.users.findById(outfit.ownerId);
    if (owner) {
      db.users.update(owner.id, {
        totalEarnings: (owner.totalEarnings || 0) + totalPrice,
        totalRentals: (owner.totalRentals || 0) + 1,
        textileWasteSaved: Number(((owner.textileWasteSaved || 0) + 0.8).toFixed(1))
      });
    }

    // Update renter stats
    const renter = db.users.findById(req.userId);
    if (renter) {
      db.users.update(req.userId, {
        totalRentals: (renter.totalRentals || 0) + 1,
        textileWasteSaved: Number(((renter.textileWasteSaved || 0) + 0.8).toFixed(1))
      });
    }

    res.status(201).json({ message: 'Outfit booked successfully! 🎉', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/bookings/my-rentals ─────────────────────────────────────────────
router.get('/my-rentals', auth, (req, res) => {
  try {
    const list = db.bookings.findByRenter(req.userId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/bookings/my-listings ────────────────────────────────────────────
router.get('/my-listings', auth, (req, res) => {
  try {
    const list = db.bookings.findByOwner(req.userId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── PUT /api/bookings/:id/cancel ─────────────────────────────────────────────
router.put('/:id/cancel', auth, (req, res) => {
  try {
    const booking = db.bookings.findById(req.params.id);

    if (!booking || booking.renterId !== req.userId || !['pending', 'confirmed'].includes(booking.status)) {
      return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
    }

    db.bookings.update(booking.id, { status: 'cancelled' });
    db.outfits.update(booking.outfitId, { isAvailable: true });

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
