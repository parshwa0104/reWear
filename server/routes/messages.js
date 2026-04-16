const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, outfitId, text } = req.body;

    const message = await prisma.message.create({
      data: {
        senderId: req.userId,
        receiverId,
        outfitId,
        text
      },
      include: {
        sender: { select: { name: true, avatar: true } },
        receiver: { select: { name: true, avatar: true } }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for an outfit conversation between two users
router.get('/conversation/:outfitId/:otherUserId', auth, async (req, res) => {
  try {
    const { outfitId, otherUserId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        outfitId,
        OR: [
          { senderId: req.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: req.userId }
        ]
      },
      include: {
        sender: { select: { name: true, avatar: true } },
        receiver: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: { outfitId, senderId: otherUserId, receiverId: req.userId, isRead: false },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all chat threads for current user
router.get('/threads', auth, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId },
          { receiverId: req.userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['outfitId'], // Get only the latest message per outfit thread
      include: {
        sender: { select: { name: true, avatar: true } },
        receiver: { select: { name: true, avatar: true } },
        outfit: { select: { title: true, images: true } }
      }
    });

    const formattedMessages = messages.map(m => ({
      ...m,
      outfit: { ...m.outfit, images: JSON.parse(m.outfit.images || "[]") }
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
