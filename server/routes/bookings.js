const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const router = express.Router();

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { outfitId, startDate, endDate } = req.body;

    const outfit = await prisma.outfit.findUnique({ where: { id: outfitId } });
    if (!outfit) return res.status(404).json({ error: 'Outfit not found' });
    if (!outfit.isAvailable) return res.status(400).json({ error: 'Outfit is not available' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const totalPrice = totalDays * outfit.pricePerDay;
    const depositAmount = outfit.securityDeposit;

    // Use a transaction since we are updating multiple tables
    const [booking] = await prisma.$transaction([
      // 1. Create booking
      prisma.booking.create({
        data: {
          outfitId,
          renterId: req.userId,
          ownerId: outfit.ownerId,
          startDate: start,
          endDate: end,
          totalDays,
          totalPrice,
          depositAmount,
          status: 'confirmed'
        },
        include: {
          outfit: { select: { title: true, images: true, pricePerDay: true } },
          renter: { select: { name: true } },
          owner: { select: { name: true } }
        }
      }),
      // 2. Update outfit availability
      prisma.outfit.update({
        where: { id: outfitId },
        data: { isAvailable: false, totalRentals: { increment: 1 } }
      }),
      // 3. Update owner earnings
      prisma.user.update({
        where: { id: outfit.ownerId },
        data: { totalEarnings: { increment: totalPrice }, totalRentals: { increment: 1 }, textileWasteSaved: { increment: 0.8 } }
      }),
      // 4. Update renter stats
      prisma.user.update({
        where: { id: req.userId },
        data: { totalRentals: { increment: 1 }, textileWasteSaved: { increment: 0.8 } }
      })
    ]);

    res.status(201).json({ 
      message: 'Outfit booked successfully! 🎉', 
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's bookings (as renter)
router.get('/my-rentals', auth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { renterId: req.userId },
      include: {
        outfit: { select: { id: true, title: true, images: true, pricePerDay: true, category: true } },
        owner: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Parse images array
    const formattedBookings = bookings.map(b => ({
      ...b,
      outfit: { ...b.outfit, images: JSON.parse(b.outfit.images || "[]") }
    }));
    
    res.json(formattedBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for user's outfits (as owner)
router.get('/my-listings', auth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { ownerId: req.userId },
      include: {
        outfit: { select: { title: true, images: true, pricePerDay: true } },
        renter: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedBookings = bookings.map(b => ({
      ...b,
      outfit: { ...b.outfit, images: JSON.parse(b.outfit.images || "[]") }
    }));
    
    res.json(formattedBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { 
        id: req.params.id, 
        renterId: req.userId,
        status: { in: ['pending', 'confirmed'] }
      }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'cancelled' }
      }),
      prisma.outfit.update({
        where: { id: booking.outfitId },
        data: { isAvailable: true }
      })
    ]);

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
