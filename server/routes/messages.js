const express = require('express');
const db = require('../store');
const auth = require('../middleware/auth');
const router = express.Router();

// ─── POST /api/messages ───────────────────────────────────────────────────────
router.post('/', auth, (req, res) => {
  try {
    const { receiverId, outfitId, text } = req.body;
    if (!receiverId || !outfitId || !text) {
      return res.status(400).json({ error: 'receiverId, outfitId and text are required' });
    }

    const message = db.messages.create({
      senderId: req.userId,
      receiverId,
      outfitId,
      text
    });

    // Attach sender/receiver info for response
    const sender = db.users.findById(req.userId);
    const receiver = db.users.findById(receiverId);

    res.status(201).json({
      ...message,
      sender: db.users.withoutPassword(sender),
      receiver: db.users.withoutPassword(receiver)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/messages/conversation/:outfitId/:otherUserId ───────────────────
router.get('/conversation/:outfitId/:otherUserId', auth, (req, res) => {
  try {
    const { outfitId, otherUserId } = req.params;

    const msgs = db.messages.findConversation(outfitId, req.userId, otherUserId);

    // Mark messages from otherUser as read
    db.messages.markRead(outfitId, otherUserId, req.userId);

    res.json(msgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/messages/threads ────────────────────────────────────────────────
router.get('/threads', auth, (req, res) => {
  try {
    const threads = db.messages.findThreads(req.userId);
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
